const LeaveBalance = require('../models/LeaveBalance');
const LeaveType = require('../models/LeaveType');
const Employee = require('../models/Employee');

// @desc    Initialize leave balances for an employee (or all)
// @route   POST /api/v1/leaves/balance/initialize
// @access  Admin
exports.initializeBalances = async (req, res) => {
    try {
        const { year = new Date().getFullYear(), employeeId } = req.body;

        // Get all active leave types
        const leaveTypes = await LeaveType.find({ isActive: true });
        if (!leaveTypes.length) {
            return res.status(400).json({ success: false, message: 'No active leave types found. Please configure leave types first.' });
        }

        // Determine target employees
        let employees = [];
        if (employeeId) {
            const emp = await Employee.findById(employeeId);
            if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
            employees = [emp];
        } else {
            employees = await Employee.find({ status: 'active' });
        }

        const results = { success: 0, failed: 0, errors: [] };

        for (const emp of employees) {
            for (const type of leaveTypes) {
                try {
                    // Check if balance already exists
                    let balance = await LeaveBalance.findOne({
                        employeeId: emp._id,
                        leaveType: type._id,
                        year
                    });

                    if (!balance) {
                        // Create new balance record
                        balance = new LeaveBalance({
                            employeeId: emp._id,
                            leaveType: type._id,
                            year,
                            totalAccrued: type.maxDaysPerYear, // Default to full quota for now (accrual logic can refine this)
                            used: 0,
                            pending: 0,
                            history: [{
                                action: 'INITIAL_ALLOCATION',
                                days: type.maxDaysPerYear,
                                reason: 'Yearly allocation',
                                performedBy: req.user._id
                            }]
                        });
                        await balance.save();
                        results.success++;
                    }
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Failed for ${emp.employeeCode} - ${type.name}: ${err.message}`);
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Initialization complete. Created/Verified balances for ${employees.length} employees.`,
            results
        });

    } catch (error) {
        console.error('Initialize Balances Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get my leave balances
// @route   GET /api/v1/leaves/balance/my
// @access  Private (Employee)
exports.getMyBalances = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        // Find employee record for current user
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const balances = await LeaveBalance.find({
            employeeId: employee._id,
            year
        }).populate('leaveType', 'name code color');

        const enrichedBalances = balances.map(b => ({
            _id: b._id,
            leaveType: b.leaveType,
            totalAccrued: b.totalAccrued,
            used: b.used,
            pending: b.pending,
            available: b.totalAccrued - b.used - b.pending
        }));

        res.status(200).json({
            success: true,
            data: enrichedBalances
        });

    } catch (error) {
        console.error('Get My Balances Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get employee balances (Admin)
// @route   GET /api/v1/leaves/balance/:employeeId
// @access  Admin
exports.getEmployeeBalances = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();

        const balances = await LeaveBalance.find({
            employeeId: req.params.employeeId,
            year
        }).populate('leaveType', 'name code color');

        const enrichedBalances = balances.map(b => ({
            _id: b._id,
            leaveType: b.leaveType,
            totalAccrued: b.totalAccrued,
            used: b.used,
            pending: b.pending,
            available: b.totalAccrued - b.used - b.pending
        }));

        res.status(200).json({
            success: true,
            data: enrichedBalances
        });

    } catch (error) {
        console.error('Get Employee Balances Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
