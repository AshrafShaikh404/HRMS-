const LeaveType = require('../models/LeaveType');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveApplication = require('../models/LeaveApplication');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const CalendarEvent = require('../models/CalendarEvent');
const mongoose = require('mongoose');

// --- Leave Types Management ---
exports.createLeaveType = async (req, res) => {
    try {
        const leaveType = await LeaveType.create(req.body);
        res.status(201).json({ success: true, data: leaveType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLeaveTypes = async (req, res) => {
    try {
        const types = await LeaveType.find({ isActive: true });
        res.status(200).json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLeaveType = async (req, res) => {
    try {
        const leaveType = await LeaveType.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
        res.status(200).json({ success: true, data: leaveType });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteLeaveType = async (req, res) => {
    try {
        const leaveType = await LeaveType.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!leaveType) return res.status(404).json({ success: false, message: 'Leave type not found' });
        res.status(200).json({ success: true, message: 'Leave type deactivated' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- Leave Policies Management ---
exports.createLeavePolicy = async (req, res) => {
    try {
        const policy = await LeavePolicy.create(req.body);
        res.status(201).json({ success: true, data: policy });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLeavePolicies = async (req, res) => {
    try {
        const policies = await LeavePolicy.find({ isActive: true }).populate('leaveTypes.leaveType');
        res.status(200).json({ success: true, data: policies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLeavePolicy = async (req, res) => {
    try {
        const policy = await LeavePolicy.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('leaveTypes.leaveType');
        if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
        res.status(200).json({ success: true, data: policy });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- Leave Application ---
exports.applyLeave = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason, halfDay, halfDaySession } = req.body;

        // Get employee
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        // Calculate Duration
        const start = new Date(startDate);
        const end = new Date(endDate);

        let totalDays;
        if (halfDay) {
            totalDays = 0.5;
            if (start.getTime() !== end.getTime()) {
                return res.status(400).json({ success: false, message: 'Half day leave must be on a single date' });
            }
        } else {
            const diffTime = Math.abs(end - start);
            totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        }

        // Validate Leave Type exists
        const typeExists = await LeaveType.findById(leaveType);
        if (!typeExists) {
            return res.status(404).json({ success: false, message: 'Invalid Leave Type' });
        }

        // Check Balance (Phase 3 will have full implementation)
        // For now: Basic check using first available policy
        const policies = await LeavePolicy.find({ isActive: true }).populate('leaveTypes.leaveType');
        if (policies.length > 0) {
            const policy = policies[0];
            const policyItem = policy.leaveTypes.find(lt => lt.leaveType._id.toString() === leaveType);

            if (policyItem) {
                // Calculate used days
                const used = await LeaveApplication.aggregate([
                    {
                        $match: {
                            employeeId: employee._id,
                            leaveType: new mongoose.Types.ObjectId(leaveType),
                            status: 'Approved'
                        }
                    },
                    { $group: { _id: null, total: { $sum: '$totalDays' } } }
                ]);

                const usedDays = used.length ? used[0].total : 0;
                const available = policyItem.quota - usedDays;

                if (available < totalDays) {
                    return res.status(400).json({
                        success: false,
                        message: `Insufficient leave balance. Available: ${available} days, Requested: ${totalDays} days`
                    });
                }
            }
        }

        // Create Application
        const application = await LeaveApplication.create({
            employeeId: employee._id,
            leaveType,
            startDate,
            endDate,
            totalDays,
            reason,
            halfDay,
            halfDaySession
        });

        const populated = await LeaveApplication.findById(application._id).populate('leaveType');

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: populated
        });

    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLeaveHistory = async (req, res) => {
    try {
        let query = {};

        if (req.user.role.name === 'Employee' || req.user.role.name === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                return res.status(404).json({ success: false, message: 'Employee profile not found' });
            }
            query.employeeId = employee._id;
        } else if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        const history = await LeaveApplication.find(query)
            .populate('leaveType')
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: history });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPendingApprovals = async (req, res) => {
    try {
        const pending = await LeaveApplication.find({ status: 'Pending' })
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('leaveType')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: pending, count: pending.length });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const application = await LeaveApplication.findById(id).populate('employeeId').populate('leaveType');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        if (application.status !== 'Pending') {
            return res.status(400).json({ success: false, message: `Leave is already ${application.status}` });
        }

        application.status = status;
        application.approvedBy = req.user._id;
        application.approvedAt = new Date();
        if (status === 'Rejected') {
            application.rejectionReason = rejectionReason;
        }
        await application.save();

        // If approved and affectsAttendance, mark attendance
        if (status === 'Approved' && application.leaveType.affectsAttendance) {
            const fromDate = new Date(application.startDate);
            const toDate = new Date(application.endDate);

            for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
                const attendanceDate = new Date(date);
                attendanceDate.setHours(0, 0, 0, 0);

                await Attendance.findOneAndUpdate(
                    {
                        employeeId: application.employeeId._id,
                        date: attendanceDate
                    },
                    {
                        employeeId: application.employeeId._id,
                        date: attendanceDate,
                        status: 'leave',
                        remarks: `${application.leaveType.name} approved`,
                        updatedBy: req.user._id
                    },
                    { upsert: true, new: true }
                );
            }

            // Create Calendar Event
            try {
                await CalendarEvent.create({
                    title: `Leave: ${application.employeeId.firstName} ${application.employeeId.lastName}`,
                    description: `Leave Type: ${application.leaveType.name}\nReason: ${application.reason}`,
                    eventType: 'LEAVE',
                    start: application.startDate,
                    end: application.endDate,
                    allDay: true,
                    participants: [application.employeeId._id],
                    visibility: 'TEAM',
                    creator: req.user._id,
                    source: 'HRMS'
                });
            } catch (calError) {
                console.error('Failed to create calendar event:', calError);
            }
        }

        res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, data: application });
    } catch (error) {
        console.error('Update leave status error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getLeaveBalance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee profile not found' });
        }

        const policies = await LeavePolicy.find({ isActive: true }).populate('leaveTypes.leaveType');
        if (!policies.length) {
            return res.status(200).json({ success: true, data: [] });
        }

        const policy = policies[0];
        const balance = [];

        for (const item of policy.leaveTypes) {
            const used = await LeaveApplication.aggregate([
                {
                    $match: {
                        employeeId: employee._id,
                        leaveType: item.leaveType._id,
                        status: 'Approved'
                    }
                },
                { $group: { _id: null, total: { $sum: '$totalDays' } } }
            ]);

            const usedDays = used.length ? used[0].total : 0;

            balance.push({
                leaveType: item.leaveType,
                quota: item.quota,
                used: usedDays,
                available: item.quota - usedDays
            });
        }

        res.status(200).json({ success: true, data: balance });
    } catch (error) {
        console.error("Balance Error", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelLeave = async (req, res) => {
    try {
        const application = await LeaveApplication.findById(req.params.id).populate('leaveType');
        if (!application) {
            return res.status(404).json({ success: false, message: 'Leave application not found' });
        }

        // Check authorization
        const employee = await Employee.findOne({ userId: req.user._id });
        const roleName = req.user.role.name || req.user.role;

        if ((roleName === 'Employee' || roleName === 'employee') && employee) {
            if (application.employeeId.toString() !== employee._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            if (application.status !== 'Pending') {
                return res.status(400).json({ success: false, message: 'Can only cancel pending leaves' });
            }
        }

        const originalStatus = application.status;
        application.status = 'Cancelled';
        await application.save();

        // Remove attendance if was approved
        if (originalStatus === 'Approved' && application.leaveType.affectsAttendance) {
            await Attendance.deleteMany({
                employeeId: application.employeeId,
                date: { $gte: application.startDate, $lte: application.endDate },
                status: 'leave'
            });

            try {
                await CalendarEvent.deleteOne({
                    eventType: 'LEAVE',
                    participants: application.employeeId,
                    start: application.startDate,
                    end: application.endDate,
                    source: 'HRMS'
                });
            } catch (calError) {
                console.error('Failed to remove calendar event:', calError);
            }
        }

        res.status(200).json({ success: true, message: 'Leave cancelled successfully' });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get leave balance
// @route   GET /api/v1/leaves/balance
// @access  Private
exports.getLeaveBalance = async (req, res) => {
    try {
        let employeeId;

        if (req.query.employeeId && (req.user.role === 'admin' || req.user.role === 'hr')) {
            employeeId = req.query.employeeId;
        } else {
            // Get employee for current user
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                // If user is Admin/HR but has no employee profile, return empty balance instead of 404
                if (req.user.role === 'admin' || req.user.role === 'hr') {
                    return res.status(200).json({
                        success: true,
                        data: {
                            balances: {
                                casualLeave: { totalAllowed: 0, used: 0, available: 0, pending: 0 },
                                sickLeave: { totalAllowed: 0, used: 0, available: 0, pending: 0 },
                                earnedLeave: { totalAllowed: 0, used: 0, available: 0, pending: 0 },
                                maternityLeave: { totalAllowed: 0, used: 0, available: 0, pending: 0 }
                            }
                        }
                    });
                }
                return res.status(404).json({
                    success: false,
                    message: 'Employee profile not found'
                });
            }
            employeeId = employee._id;
        }

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Get pending leaves
        const pendingLeaves = await Leave.find({
            employeeId,
            status: 'pending'
        });

        const pendingByType = {
            casual: pendingLeaves.filter(l => l.leaveType === 'casual').reduce((sum, l) => sum + l.numberOfDays, 0),
            sick: pendingLeaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + l.numberOfDays, 0),
            earned: pendingLeaves.filter(l => l.leaveType === 'earned').reduce((sum, l) => sum + l.numberOfDays, 0),
            maternity: pendingLeaves.filter(l => l.leaveType === 'maternity').reduce((sum, l) => sum + l.numberOfDays, 0)
        };

        // Get used leaves (approved this year)
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const approvedLeaves = await Leave.find({
            employeeId,
            status: 'approved',
            fromDate: { $gte: yearStart }
        });

        const usedByType = {
            casual: approvedLeaves.filter(l => l.leaveType === 'casual').reduce((sum, l) => sum + l.numberOfDays, 0),
            sick: approvedLeaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + l.numberOfDays, 0),
            earned: approvedLeaves.filter(l => l.leaveType === 'earned').reduce((sum, l) => sum + l.numberOfDays, 0),
            maternity: approvedLeaves.filter(l => l.leaveType === 'maternity').reduce((sum, l) => sum + l.numberOfDays, 0)
        };

        res.status(200).json({
            success: true,
            data: {
                employeeId: employee._id,
                balances: {
                    casualLeave: {
                        totalAllowed: employee.leaveBalance.casualLeave,
                        used: usedByType.casual,
                        available: employee.leaveBalance.casualLeave - usedByType.casual,
                        pending: pendingByType.casual
                    },
                    sickLeave: {
                        totalAllowed: employee.leaveBalance.sickLeave,
                        used: usedByType.sick,
                        available: employee.leaveBalance.sickLeave - usedByType.sick,
                        pending: pendingByType.sick
                    },
                    earnedLeave: {
                        totalAllowed: employee.leaveBalance.earnedLeave,
                        used: usedByType.earned,
                        available: employee.leaveBalance.earnedLeave - usedByType.earned,
                        pending: pendingByType.earned
                    },
                    maternityLeave: {
                        totalAllowed: employee.leaveBalance.maternityLeave,
                        used: usedByType.maternity,
                        available: employee.leaveBalance.maternityLeave - usedByType.maternity,
                        pending: pendingByType.maternity
                    }
                },
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Get leave balance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave balance',
            error: error.message
        });
    }
};

// @desc    Apply for leave
// @route   POST /api/v1/leaves/apply
// @access  Private
exports.applyLeave = async (req, res) => {
    try {
        const { employeeId, leaveType, fromDate, toDate, reason, attachment } = req.body;

        let targetEmployeeId;

        if (employeeId && (req.user.role === 'admin' || req.user.role === 'hr')) {
            targetEmployeeId = employeeId;
        } else {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee profile not found'
                });
            }
            targetEmployeeId = employee._id;
        }

        // Validate dates
        const from = new Date(fromDate);
        const to = new Date(toDate);

        if (to < from) {
            return res.status(400).json({
                success: false,
                message: 'To date cannot be before from date'
            });
        }

        // Calculate days
        const diffTime = Math.abs(to - from);
        const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        // Check leave balance (for paid leaves)
        if (leaveType !== 'unpaid') {
            const employee = await Employee.findById(targetEmployeeId);
            const leaveBalanceKey = leaveType + 'Leave';

            // Get used leaves this year
            const yearStart = new Date(new Date().getFullYear(), 0, 1);
            const approvedLeaves = await Leave.find({
                employeeId: targetEmployeeId,
                status: 'approved',
                leaveType,
                fromDate: { $gte: yearStart }
            });

            const usedDays = approvedLeaves.reduce((sum, l) => sum + l.numberOfDays, 0);
            const available = employee.leaveBalance[leaveBalanceKey] - usedDays;

            if (available < numberOfDays) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient leave balance. Available: ${available} days, Requested: ${numberOfDays} days`
                });
            }
        }

        // Create leave application
        const leave = await Leave.create({
            employeeId: targetEmployeeId,
            leaveType,
            fromDate: from,
            toDate: to,
            numberOfDays,
            reason,
            attachment,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Leave application submitted successfully',
            data: {
                leaveId: leave._id,
                leaveType: leave.leaveType,
                numberOfDays: leave.numberOfDays,
                fromDate: leave.fromDate,
                toDate: leave.toDate,
                status: leave.status,
                appliedAt: leave.appliedAt
            }
        });
    } catch (error) {
        console.error('Apply leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying for leave',
            error: error.message
        });
    }
};

// @desc    Get pending leave approvals
// @route   GET /api/v1/leaves/pending-approvals
// @access  Private (Admin, HR)
exports.getPendingApprovals = async (req, res) => {
    try {
        const pendingLeaves = await Leave.find({ status: 'pending' })
            .populate('employeeId', 'firstName lastName employeeCode department')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                pendingLeaves,
                count: pendingLeaves.length
            }
        });
    } catch (error) {
        console.error('Get pending approvals error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending approvals',
            error: error.message
        });
    }
};

// @desc    Approve leave
// @route   PUT /api/v1/leaves/:id/approve
// @access  Private (Admin, HR)
exports.approveLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id).populate('employeeId');

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Leave is already ${leave.status}`
            });
        }

        // Update leave status
        leave.status = 'approved';
        leave.approvedBy = req.user._id;
        leave.approvalDate = new Date();
        await leave.save();

        // Mark attendance as leave for the date range
        const fromDate = new Date(leave.fromDate);
        const toDate = new Date(leave.toDate);

        for (let date = new Date(fromDate); date <= toDate; date.setDate(date.getDate() + 1)) {
            const attendanceDate = new Date(date);
            attendanceDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(attendanceDate);
            nextDay.setDate(nextDay.getDate() + 1);

            await Attendance.findOneAndUpdate(
                {
                    employeeId: leave.employeeId._id,
                    date: { $gte: attendanceDate, $lt: nextDay }
                },
                {
                    employeeId: leave.employeeId._id,
                    date: attendanceDate,
                    status: 'leave',
                    remarks: `${leave.leaveType} leave approved`,
                    updatedBy: req.user._id
                },
                { upsert: true, new: true }
            );
        }

        // AUTOMATION: Create Calendar Event
        try {
            await CalendarEvent.create({
                title: `Leave: ${leave.employeeId.firstName} ${leave.employeeId.lastName}`,
                description: `Leave Type: ${leave.leaveType}\nReason: ${leave.reason}`,
                eventType: 'LEAVE',
                start: leave.fromDate,
                end: leave.toDate,
                allDay: true,
                participants: [leave.employeeId._id],
                visibility: 'TEAM',
                creator: req.user._id,
                source: 'HRMS',
                department: leave.employeeId.department
            });
        } catch (calError) {
            console.error('Failed to create calendar event:', calError);
        }

        res.status(200).json({
            success: true,
            message: 'Leave approved successfully',
            data: leave
        });
    } catch (error) {
        console.error('Approve leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error approving leave',
            error: error.message
        });
    }
};

// @desc    Reject leave
// @route   PUT /api/v1/leaves/:id/reject
// @access  Private (Admin, HR)
exports.rejectLeave = async (req, res) => {
    try {
        const { rejectionReason } = req.body;

        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        if (leave.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Leave is already ${leave.status}`
            });
        }

        leave.status = 'rejected';
        leave.approvedBy = req.user._id;
        leave.approvalDate = new Date();
        leave.rejectionReason = rejectionReason || 'Not specified';
        await leave.save();

        res.status(200).json({
            success: true,
            message: 'Leave rejected',
            data: leave
        });
    } catch (error) {
        console.error('Reject leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rejecting leave',
            error: error.message
        });
    }
};

// @desc    Get leave history
// @route   GET /api/v1/leaves/history
// @access  Private
exports.getLeaveHistory = async (req, res) => {
    try {
        let query = {};

        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee profile not found'
                });
            }
            query.employeeId = employee._id;
        } else if (req.query.employeeId) {
            query.employeeId = req.query.employeeId;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        const leaves = await Leave.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('approvedBy', 'name')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            data: leaves
        });
    } catch (error) {
        console.error('Get leave history error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching leave history',
            error: error.message
        });
    }
};

// @desc    Cancel leave
// @route   DELETE /api/v1/leaves/:id
// @access  Private
exports.cancelLeave = async (req, res) => {
    try {
        const leave = await Leave.findById(req.params.id);

        if (!leave) {
            return res.status(404).json({
                success: false,
                message: 'Leave application not found'
            });
        }

        // Check authorization
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee || leave.employeeId.toString() !== employee._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to cancel this leave'
                });
            }

            // Employee can only cancel pending leaves
            if (leave.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot cancel leave that is not pending'
                });
            }
        }

        // HR/Admin can cancel approved leaves too (before start date)
        if (leave.status === 'approved' && new Date() >= leave.fromDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel leave that has already started'
            });
        }

        const originalStatus = leave.status; // Store original status before changing to 'cancelled'
        leave.status = 'cancelled';
        await leave.save();

        // Remove leave from attendance if it was approved
        if (originalStatus === 'approved') {
            await Attendance.deleteMany({
                employeeId: leave.employeeId,
                date: { $gte: leave.fromDate, $lte: leave.toDate },
                status: 'leave'
            });

            // AUTOMATION: Remove/Update Calendar Event for cancelled leave
            try {
                // Assuming CalendarEvent model exists and is imported
                // Find and delete the corresponding calendar event
                await CalendarEvent.deleteOne({
                    eventType: 'LEAVE',
                    participants: leave.employeeId,
                    start: leave.fromDate,
                    end: leave.toDate,
                    source: 'HRMS'
                });
            } catch (calError) {
                console.error('Failed to remove calendar event for cancelled leave:', calError);
                // Don't fail the request, just log error
            }
        }

        res.status(200).json({
            success: true,
            message: 'Leave cancelled successfully'
        });
    } catch (error) {
        console.error('Cancel leave error:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling leave',
            error: error.message
        });
    }
};

// @desc    Export leave records as CSV
// @route   GET /api/v1/leaves/export/csv
// @access  Private (Admin, HR)
exports.exportLeaveCSV = async (req, res) => {
    try {
        const { generateCSV, deleteReport, formatDate } = require('../utils/reportGenerator');
        const { employeeId, startDate, endDate, status, leaveType } = req.query;

        let query = {};

        // Apply filters
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;
        if (startDate || endDate) {
            query.fromDate = {};
            if (startDate) query.fromDate.$gte = new Date(startDate);
            if (endDate) query.fromDate.$lte = new Date(endDate);
        }

        const leaves = await Leave.find(query)
            .populate('employeeId', 'firstName lastName employeeCode department')
            .populate('approvedBy', 'name')
            .sort({ appliedAt: -1 });

        // Prepare CSV data
        const csvData = leaves.map(leave => ({
            employeeCode: leave.employeeId?.employeeCode || 'N/A',
            employeeName: leave.employeeId ?
                `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 'N/A',
            department: leave.employeeId?.department || 'N/A',
            leaveType: leave.leaveType,
            fromDate: formatDate(leave.fromDate),
            toDate: formatDate(leave.toDate),
            numberOfDays: leave.numberOfDays,
            status: leave.status,
            reason: leave.reason || '',
            appliedDate: formatDate(leave.appliedAt),
            approvedBy: leave.approvedBy?.name || 'N/A',
            approvalDate: leave.approvalDate ? formatDate(leave.approvalDate) : 'N/A'
        }));

        const headers = [
            { id: 'employeeCode', title: 'Employee Code' },
            { id: 'employeeName', title: 'Employee Name' },
            { id: 'department', title: 'Department' },
            { id: 'leaveType', title: 'Leave Type' },
            { id: 'fromDate', title: 'Start Date' },
            { id: 'toDate', title: 'End Date' },
            { id: 'numberOfDays', title: 'Days' },
            { id: 'status', title: 'Status' },
            { id: 'reason', title: 'Reason' },
            { id: 'appliedDate', title: 'Applied On' },
            { id: 'approvedBy', title: 'Approved By' },
            { id: 'approvalDate', title: 'Approval Date' }
        ];

        const filename = `leave-records-${Date.now()}.csv`;
        const filePath = await generateCSV(csvData, headers, filename);

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            deleteReport(filePath);
        });
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting leave records to CSV',
            error: error.message
        });
    }
};

// @desc    Export leave records as PDF
// @route   GET /api/v1/leaves/export/pdf
// @access  Private (Admin, HR)
exports.exportLeavePDF = async (req, res) => {
    try {
        const { generatePDF, deleteReport, formatDate } = require('../utils/reportGenerator');
        const { employeeId, startDate, endDate, status, leaveType } = req.query;

        let query = {};

        // Apply filters
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;
        if (leaveType) query.leaveType = leaveType;
        if (startDate || endDate) {
            query.fromDate = {};
            if (startDate) query.fromDate.$gte = new Date(startDate);
            if (endDate) query.fromDate.$lte = new Date(endDate);
        }

        const leaves = await Leave.find(query)
            .populate('employeeId', 'firstName lastName employeeCode department')
            .populate('approvedBy', 'name')
            .sort({ appliedAt: -1 });

        // Calculate summary
        const summary = {
            'Total Applications': leaves.length,
            'Total Days Requested': leaves.reduce((sum, l) => sum + l.numberOfDays, 0),
            'Approved': leaves.filter(l => l.status === 'approved').length,
            'Pending': leaves.filter(l => l.status === 'pending').length,
            'Rejected': leaves.filter(l => l.status === 'rejected').length
        };

        // Prepare PDF data
        const pdfData = leaves.map(leave => ({
            employeeCode: leave.employeeId?.employeeCode || 'N/A',
            employeeName: leave.employeeId ?
                `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 'N/A',
            leaveType: leave.leaveType,
            fromDate: formatDate(leave.fromDate),
            toDate: formatDate(leave.toDate),
            days: leave.numberOfDays.toString(),
            status: leave.status.charAt(0).toUpperCase() + leave.status.slice(1)
        }));

        const headers = [
            { key: 'employeeCode', title: 'Code', align: 'left' },
            { key: 'employeeName', title: 'Employee', align: 'left' },
            { key: 'leaveType', title: 'Type', align: 'left' },
            { key: 'fromDate', title: 'From', align: 'left' },
            { key: 'toDate', title: 'To', align: 'left' },
            { key: 'days', title: 'Days', align: 'right' },
            { key: 'status', title: 'Status', align: 'left' }
        ];

        let dateRange = '';
        if (startDate && endDate) {
            dateRange = `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`;
        }

        const options = {
            companyName: 'HRMS - Human Resource Management System',
            dateRange,
            summary
        };

        const filename = `leave-report-${Date.now()}.pdf`;
        const filePath = await generatePDF('Leave Report', headers, pdfData, filename, options);

        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
            }
            deleteReport(filePath);
        });
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting leave records to PDF',
            error: error.message
        });
    }
};

