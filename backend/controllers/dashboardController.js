const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');

// @desc    Get admin dashboard data
// @route   GET /api/v1/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res) => {
    try {
        // Total employees count
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'active' });
        const inactiveEmployees = await Employee.countDocuments({ status: 'inactive' });

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lt: tomorrow }
        });

        const presentToday = todayAttendance.filter(a => a.status === 'present').length;
        const halfDayToday = todayAttendance.filter(a => a.status === 'half_day').length;
        const onLeaveToday = todayAttendance.filter(a => a.status === 'leave').length;

        // Absent = Active Employees - (Present + Half Day + On Leave)
        // Ensure result is not negative (in case of data inconsistency)
        const recordedPresence = presentToday + halfDayToday + onLeaveToday;
        const absentToday = Math.max(0, activeEmployees - recordedPresence);

        // Pending leaves
        const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

        // Department breakdown
        const departmentBreakdown = await Employee.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent activities (last 5 employees added)
        const recentActivities = await Employee.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName department createdAt');

        res.status(200).json({
            success: true,
            data: {
                employeeStats: {
                    total: totalEmployees,
                    active: activeEmployees,
                    inactive: inactiveEmployees
                },
                todayAttendance: {
                    present: presentToday,
                    absent: absentToday,
                    halfDay: halfDayToday,
                    onLeave: onLeaveToday,
                    total: todayAttendance.length,
                    attendancePercentage: activeEmployees > 0
                        ? ((presentToday / activeEmployees) * 100).toFixed(2)
                        : 0
                },
                pendingLeaves,
                departmentBreakdown,
                recentActivities: recentActivities.map(e => ({
                    name: `${e.firstName} ${e.lastName}`,
                    department: e.department,
                    addedAt: e.createdAt
                }))
            }
        });
    } catch (error) {
        console.error('Get admin dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching admin dashboard data',
            error: error.message
        });
    }
};

// @desc    Get HR dashboard data
// @route   GET /api/v1/dashboard/hr
// @access  Private (HR)
exports.getHRDashboard = async (req, res) => {
    try {
        // Employee count by department
        const departmentStats = await Employee.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 },
                    avgSalary: { $avg: '$salary' }
                }
            }
        ]);

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lt: tomorrow }
        });

        // Last 7 days attendance trend
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const dayAttendance = await Attendance.find({
                date: { $gte: date, $lt: nextDay },
                status: 'present'
            });

            last7Days.push({
                date: date.toISOString().split('T')[0],
                count: dayAttendance.length
            });
        }

        // Pending leave approvals
        const pendingLeaves = await Leave.find({ status: 'pending' })
            .populate('employeeId', 'firstName lastName employeeCode')
            .sort({ appliedAt: -1 })
            .limit(10);

        // Current month payroll status
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const monthlyPayroll = await Payroll.find({
            month: currentMonth,
            year: currentYear
        });

        // Employees with low leave balance (< 3 days)
        const lowLeaveBalanceEmployees = await Employee.find({
            status: 'active',
            $or: [
                { 'leaveBalance.casualLeave': { $lt: 3 } },
                { 'leaveBalance.sickLeave': { $lt: 2 } }
            ]
        }).select('firstName lastName leaveBalance').limit(5);

        res.status(200).json({
            success: true,
            data: {
                departmentStats,
                todayAttendance: {
                    present: todayAttendance.filter(a => a.status === 'present').length,
                    absent: Math.max(0, (departmentStats.reduce((sum, d) => sum + d.count, 0)) - (todayAttendance.filter(a => ['present', 'half_day', 'leave'].includes(a.status)).length)),
                    halfDay: todayAttendance.filter(a => a.status === 'half_day').length,
                    onLeave: todayAttendance.filter(a => a.status === 'leave').length
                },
                attendanceTrend: last7Days,
                pendingLeaves: pendingLeaves.map(l => ({
                    leaveId: l._id,
                    employeeName: `${l.employeeId.firstName} ${l.employeeId.lastName}`,
                    employeeCode: l.employeeId.employeeCode,
                    leaveType: l.leaveType,
                    fromDate: l.fromDate,
                    toDate: l.toDate,
                    numberOfDays: l.numberOfDays,
                    appliedAt: l.appliedAt
                })),
                payrollStatus: {
                    month: currentMonth,
                    year: currentYear,
                    generated: monthlyPayroll.length,
                    totalDisbursement: monthlyPayroll.reduce((sum, p) => sum + p.netSalary, 0)
                },
                leaveBalanceWarnings: lowLeaveBalanceEmployees.map(e => ({
                    name: `${e.firstName} ${e.lastName}`,
                    casualLeave: e.leaveBalance.casualLeave,
                    sickLeave: e.leaveBalance.sickLeave
                }))
            }
        });
    } catch (error) {
        console.error('Get HR dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching HR dashboard data',
            error: error.message
        });
    }
};

// @desc    Get employee dashboard data
// @route   GET /api/v1/dashboard/employee
// @access  Private (Employee)
exports.getEmployeeDashboard = async (req, res) => {
    try {
        // Get employee
        const employee = await Employee.findOne({ userId: req.user._id });

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found'
            });
        }

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAttendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: tomorrow }
        });

        // Leave balance
        const yearStart = new Date(new Date().getFullYear(), 0, 1);
        const approvedLeaves = await Leave.find({
            employeeId: employee._id,
            status: 'approved',
            fromDate: { $gte: yearStart }
        });

        const usedLeaves = {
            casual: approvedLeaves.filter(l => l.leaveType === 'casual').reduce((sum, l) => sum + l.numberOfDays, 0),
            sick: approvedLeaves.filter(l => l.leaveType === 'sick').reduce((sum, l) => sum + l.numberOfDays, 0),
            earned: approvedLeaves.filter(l => l.leaveType === 'earned').reduce((sum, l) => sum + l.numberOfDays, 0)
        };

        // Last payslip
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const lastPayslip = await Payroll.findOne({
            employeeId: employee._id,
            month: lastMonth.getMonth() + 1,
            year: lastMonth.getFullYear()
        });

        // This month attendance summary
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const monthAttendance = await Attendance.find({
            employeeId: employee._id,
            date: { $gte: monthStart }
        });

        res.status(200).json({
            success: true,
            data: {
                profile: {
                    name: `${employee.firstName} ${employee.lastName}`,
                    employeeCode: employee.employeeCode,
                    department: employee.department,
                    designation: employee.designation,
                    joinDate: employee.joinDate
                },
                todayStatus: {
                    checkedIn: todayAttendance ? !!todayAttendance.checkInTime : false,
                    checkedOut: todayAttendance ? !!todayAttendance.checkOutTime : false,
                    checkInTime: todayAttendance?.checkInTime,
                    checkOutTime: todayAttendance?.checkOutTime,
                    workedHours: todayAttendance?.workedHours || 0,
                    status: todayAttendance?.status || 'absent'
                },
                leaveBalance: {
                    casual: {
                        total: employee.leaveBalance.casualLeave,
                        used: usedLeaves.casual,
                        remaining: employee.leaveBalance.casualLeave - usedLeaves.casual
                    },
                    sick: {
                        total: employee.leaveBalance.sickLeave,
                        used: usedLeaves.sick,
                        remaining: employee.leaveBalance.sickLeave - usedLeaves.sick
                    },
                    earned: {
                        total: employee.leaveBalance.earnedLeave,
                        used: usedLeaves.earned,
                        remaining: employee.leaveBalance.earnedLeave - usedLeaves.earned
                    }
                },
                lastPayslip: lastPayslip ? {
                    month: lastPayslip.month,
                    year: lastPayslip.year,
                    netSalary: lastPayslip.netSalary,
                    status: lastPayslip.status
                } : null,
                thisMonthAttendance: {
                    total: monthAttendance.length,
                    present: monthAttendance.filter(a => a.status === 'present').length,
                    absent: monthAttendance.filter(a => a.status === 'absent').length,
                    leave: monthAttendance.filter(a => a.status === 'leave').length
                }
            }
        });
    } catch (error) {
        console.error('Get employee dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee dashboard data',
            error: error.message
        });
    }
};
