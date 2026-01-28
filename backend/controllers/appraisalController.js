const AppraisalCycle = require('../models/AppraisalCycle');
const AppraisalRecord = require('../models/AppraisalRecord');
const PerformanceReview = require('../models/PerformanceReview');
const SalaryStructure = require('../models/SalaryStructure');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');

// @desc    Create Appraisal Cycle
// @route   POST /api/v1/appraisals/cycles
// @access  Private (Admin, HR)
exports.createAppraisalCycle = async (req, res) => {
    try {
        const { name, linkedReviewCycle, effectiveFrom } = req.body;

        // Check if cycle already exists for this review cycle
        const existingCycle = await AppraisalCycle.findOne({ linkedReviewCycle });
        if (existingCycle) {
            return res.status(400).json({ success: false, message: 'Appraisal cycle already exists for this review cycle' });
        }

        const cycle = await AppraisalCycle.create({
            name,
            linkedReviewCycle,
            effectiveFrom,
            createdBy: req.user._id
        });

        res.status(201).json({ success: true, data: cycle });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get eligible employees for appraisal cycle
// @route   GET /api/v1/appraisals/cycles/:id/eligible-employees
// @access  Private (Admin, HR)
exports.getEligibleEmployees = async (req, res) => {
    try {
        const cycle = await AppraisalCycle.findById(req.params.id);
        if (!cycle) {
            return res.status(404).json({ success: false, message: 'Appraisal cycle not found' });
        }

        // Fetch finalized reviews for the linked review cycle
        const reviews = await PerformanceReview.find({
            reviewCycleId: cycle.linkedReviewCycle,
            status: 'Finalized'
        }).populate('employeeId', 'firstName lastName employeeCode jobInfo salary');

        // Filter out those who already have an appraisal record in this cycle
        const existingAppraisals = await AppraisalRecord.find({ appraisalCycleId: cycle._id }).select('employeeId');
        const appraisedEmployeeIds = existingAppraisals.map(a => a.employeeId.toString());

        const eligible = reviews.filter(r => !appraisedEmployeeIds.includes(r.employeeId._id.toString()));

        res.status(200).json({ success: true, count: eligible.length, data: eligible });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Propose an increment/appraisal
// @route   POST /api/v1/appraisals/propose
// @access  Private (Admin, HR)
exports.proposeIncrement = async (req, res) => {
    try {
        const { employeeId, appraisalCycleId, incrementType, incrementValue, newDesignation, remarks } = req.body;

        const cycle = await AppraisalCycle.findById(appraisalCycleId);
        if (!cycle) return res.status(404).json({ success: false, message: 'Appraisal cycle not found' });

        // Get employee and finalized review
        const employee = await Employee.findById(employeeId);
        if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });

        const review = await PerformanceReview.findOne({
            employeeId,
            reviewCycleId: cycle.linkedReviewCycle,
            status: 'Finalized'
        });

        if (!review) {
            return res.status(400).json({ success: false, message: 'Employee does not have a finalized performance review for this cycle' });
        }

        // Calculate New CTC
        const oldCTC = employee.salary || 0;
        let newCTC = oldCTC;
        if (incrementType === 'Percentage') {
            newCTC = oldCTC + (oldCTC * (incrementValue / 100));
        } else {
            newCTC = oldCTC + incrementValue;
        }

        const appraisalRecord = await AppraisalRecord.create({
            employeeId,
            appraisalCycleId,
            finalRating: review.finalRating,
            incrementType,
            incrementValue,
            oldCTC,
            newCTC,
            previousDesignation: employee.jobInfo?.designation,
            newDesignation: newDesignation || employee.jobInfo?.designation,
            effectiveFrom: cycle.effectiveFrom,
            status: 'Proposed',
            remarks
        });

        res.status(201).json({ success: true, data: appraisalRecord });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Appraisal already proposed for this employee in this cycle' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve appraisal and apply salary changes
// @route   PATCH /api/v1/appraisals/:id/approve
// @access  Private (Admin, HR)
exports.approveAppraisal = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const appraisal = await AppraisalRecord.findById(req.params.id);
        if (!appraisal) return res.status(404).json({ success: false, message: 'Appraisal record not found' });

        if (appraisal.status !== 'Proposed') {
            return res.status(400).json({ success: false, message: `Cannot approve appraisal with status: ${appraisal.status}` });
        }

        // 1. Update Employee Salary and Designation
        const employee = await Employee.findById(appraisal.employeeId);
        employee.salary = appraisal.newCTC;
        if (appraisal.newDesignation && appraisal.newDesignation.toString() !== appraisal.previousDesignation?.toString()) {
            if (!employee.jobInfo) employee.jobInfo = {};
            employee.jobInfo.designation = appraisal.newDesignation;
        }
        await employee.save({ session });

        // 2. Handle SalaryStructure Rotation/Update
        const existingStructure = await SalaryStructure.findOne({ employeeId: appraisal.employeeId, isActive: true });

        if (existingStructure) {
            // Option: Inactivate old and create new, or update existing with new effective date.
            // User requirement: "Create a new SalaryStructure entry per appraisal" or snapshots.
            // Let's go with creating a new one and inactivating old for better history.
            existingStructure.isActive = false;
            await existingStructure.save({ session });
        }

        // Calculate new components based on new CTC (using 40/40 rule seen in payroll)
        const newBasic = appraisal.newCTC * 0.40;
        const newHRA = newBasic * 0.40;

        await SalaryStructure.create([{
            employeeId: appraisal.employeeId,
            basicSalary: Math.round(newBasic),
            hra: Math.round(newHRA),
            isActive: true,
            effectiveFrom: appraisal.effectiveFrom
        }], { session });

        // 3. Finalize Appraisal Record
        appraisal.status = 'Approved';
        appraisal.approvedBy = req.user._id;
        await appraisal.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, message: 'Appraisal approved and applied successfully', data: appraisal });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reject appraisal
// @route   PATCH /api/v1/appraisals/:id/reject
// @access  Private (Admin, HR)
exports.rejectAppraisal = async (req, res) => {
    try {
        const appraisal = await AppraisalRecord.findById(req.params.id);
        if (!appraisal) return res.status(404).json({ success: false, message: 'Appraisal record not found' });

        if (appraisal.status !== 'Proposed') {
            return res.status(400).json({ success: false, message: `Cannot reject appraisal with status: ${appraisal.status}` });
        }

        appraisal.status = 'Rejected';
        appraisal.approvedBy = req.user._id;
        await appraisal.save();

        res.status(200).json({ success: true, data: appraisal });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get employee appraisal history
// @route   GET /api/v1/appraisals/my-history
// @access  Private
exports.getMyAppraisalHistory = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) return res.status(404).json({ success: false, message: 'Employee profile not found' });

        const history = await AppraisalRecord.find({ employeeId: employee._id, status: 'Approved' })
            .populate('appraisalCycleId', 'name effectiveFrom')
            .populate('previousDesignation', 'name')
            .populate('newDesignation', 'name')
            .sort({ effectiveFrom: -1 });

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all appraisals (Admin/HR)
// @route   GET /api/v1/appraisals
// @access  Private (Admin, HR)
exports.getAllAppraisals = async (req, res) => {
    try {
        const { cycleId } = req.query;
        let query = {};
        if (cycleId) query.appraisalCycleId = cycleId;

        const appraisals = await AppraisalRecord.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('appraisalCycleId', 'name')
            .populate('previousDesignation', 'name')
            .populate('newDesignation', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: appraisals });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get appraisal cycles
// @route   GET /api/v1/appraisals/cycles
// @access  Private (Admin, HR)
exports.getAppraisalCycles = async (req, res) => {
    try {
        const cycles = await AppraisalCycle.find().populate('linkedReviewCycle', 'name status').sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: cycles });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
