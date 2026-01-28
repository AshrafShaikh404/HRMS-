const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Check in
// @route   POST /api/v1/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const targetEmployeeId = employeeId || req.user._id;

        // Check authorization
        if (req.user.role === 'employee' && employeeId && employeeId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Get employee
        const employee = await Employee.findOne({ userId: targetEmployeeId });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check if already checked in today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingAttendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: tomorrow }
        });

        if (existingAttendance && existingAttendance.checkInTime) {
            return res.status(400).json({
                success: false,
                message: 'Already checked in today'
            });
        }

        // Create or update attendance
        const attendance = existingAttendance || new Attendance({
            employeeId: employee._id,
            date: new Date()
        });

        attendance.checkInTime = new Date();
        attendance.status = 'present';
        await attendance.save();

        res.status(200).json({
            success: true,
            message: 'Checked in successfully',
            data: {
                attendanceId: attendance._id,
                checkInTime: attendance.checkInTime,
                workedHours: 0,
                message: `Checked in at ${attendance.checkInTime.toLocaleTimeString()}`
            }
        });
    } catch (error) {
        console.error('Check in error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking in',
            error: error.message
        });
    }
};

// @desc    Check out
// @route   POST /api/v1/attendance/check-out
// @access  Private
exports.checkOut = async (req, res) => {
    try {
        const { employeeId } = req.body;
        const targetEmployeeId = employeeId || req.user._id;

        // Check authorization
        if (req.user.role === 'employee' && employeeId && employeeId !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        // Get employee with location
        const employee = await Employee.findOne({ userId: targetEmployeeId })
            .populate('jobInfo.location');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Determine Timezone
        const timezone = employee.jobInfo?.location?.timezone || 'UTC';
        const now = new Date();

        // Calculate 'Today' in Employee's Timezone
        const startOfDay = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(endOfDay.getDate() + 1);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: startOfDay, $lt: endOfDay }
        });

        if (!attendance || !attendance.checkInTime) {
            return res.status(400).json({
                success: false,
                message: 'Please check in first'
            });
        }

        if (attendance.checkOutTime) {
            return res.status(400).json({
                success: false,
                message: 'Already checked out today'
            });
        }

        attendance.checkOutTime = new Date();
        await attendance.save();

        res.status(200).json({
            success: true,
            message: 'Checked out successfully',
            data: {
                attendanceId: attendance._id,
                checkInTime: attendance.checkInTime,
                checkOutTime: attendance.checkOutTime,
                workedHours: attendance.workedHours,
                status: attendance.status,
                message: `Checked out at ${attendance.checkOutTime.toLocaleTimeString()}. Worked: ${attendance.workedHours} hours`
            }
        });
    } catch (error) {
        console.error('Check out error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking out',
            error: error.message
        });
    }
};

// @desc    Get attendance records
// @route   GET /api/v1/attendance
// @access  Private
exports.getAttendance = async (req, res) => {
    try {
        const { employeeId, startDate, endDate, status, page = 1, limit = 20 } = req.query;

        let query = {};

        // Authorization check
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: 'Employee profile not found'
                });
            }
            query.employeeId = employee._id;
        } else if (employeeId) {
            query.employeeId = employeeId;
        }

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // Status filter
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const attendance = await Attendance.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('markedBy', 'firstName lastName')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ date: -1 });

        const totalRecords = await Attendance.countDocuments(query);

        // Calculate summary
        const allAttendance = await Attendance.find(query);
        const summary = {
            totalDays: allAttendance.length,
            presentDays: allAttendance.filter(a => a.status === 'present').length,
            absentDays: allAttendance.filter(a => a.status === 'absent').length,
            halfDays: allAttendance.filter(a => a.status === 'half_day').length,
            leaveDays: allAttendance.filter(a => a.status === 'leave').length,
            attendancePercentage: allAttendance.length > 0
                ? ((allAttendance.filter(a => a.status === 'present' || a.status === 'leave').length / allAttendance.length) * 100).toFixed(2)
                : 0,
            avgWorkingHours: allAttendance.length > 0
                ? (allAttendance.reduce((sum, a) => sum + (a.workedHours || 0), 0) / allAttendance.length).toFixed(2)
                : 0
        };

        res.status(200).json({
            success: true,
            data: {
                attendance,
                summary,
                pagination: {
                    totalRecords,
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalRecords / parseInt(limit)),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance',
            error: error.message
        });
    }
};

// @desc    Manual attendance entry (Admin Override)
// @route   POST /api/v1/attendance/manual-entry
// @access  Private (Admin, HR)
exports.manualEntry = async (req, res) => {
    try {
        const { employeeId, date, checkInTime, checkOutTime, status, reason, remarks } = req.body;

        if (!employeeId || !date) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID and date are required'
            });
        }

        // Check locks
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        let attendance = await Attendance.findOne({
            employeeId,
            date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (attendance && attendance.isLocked) {
            return res.status(400).json({
                success: false,
                message: 'Attendance for this date is locked.'
            });
        }

        if (attendance) {
            // Update existing
            if (checkInTime !== undefined) attendance.checkInTime = checkInTime ? new Date(checkInTime) : null;
            if (checkOutTime !== undefined) attendance.checkOutTime = checkOutTime ? new Date(checkOutTime) : null;
            if (status) attendance.status = status;
            if (remarks) attendance.remarks = remarks;
            attendance.updatedBy = req.user._id;
            attendance.markedBy = req.user._id; // Set markedBy on update too

            // Re-calculate hours if times present
            if (attendance.checkInTime && attendance.checkOutTime) {
                const diffMs = attendance.checkOutTime - attendance.checkInTime;
                attendance.workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
            } else {
                attendance.workedHours = 0; // Reset if time removed
            }

        } else {
            // Create new
            attendance = new Attendance({
                employeeId,
                date: attendanceDate,
                checkInTime: checkInTime ? new Date(checkInTime) : null,
                checkOutTime: checkOutTime ? new Date(checkOutTime) : null,
                status: status || 'present',
                remarks: remarks || reason,
                updatedBy: req.user._id,
                markedBy: req.user._id
            });
            if (attendance.checkInTime && attendance.checkOutTime) {
                const diffMs = attendance.checkOutTime - attendance.checkInTime;
                attendance.workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
            }
        }

        await attendance.save();

        res.status(200).json({
            success: true,
            message: 'Attendance record updated successfully',
            data: attendance
        });
    } catch (error) {
        console.error('Manual entry error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating/updating attendance',
            error: error.message
        });
    }
};

// @desc    Bulk attendance marking
// @route   POST /api/v1/attendance/bulk
// @access  Private (Admin, HR)
exports.bulkAttendance = async (req, res) => {
    try {
        const { employeeIds, date, status, remarks } = req.body;

        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0 || !date) {
            return res.status(400).json({ success: false, message: 'Invalid payload' });
        }

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Check if locked - Check any existing record for this date (assuming daily lock applies globally or per record)
        // Implementation choice: Lock is per record. But maybe we assume if one is locked, admin knows. 
        // Or cleaner: skip locked ones or fail. Let's fail if any is locked to be safe, or just update unlocked.
        // Let's update all unlocked.

        let updatedCount = 0;
        let lockedCount = 0;

        for (const empId of employeeIds) {
            const nextDay = new Date(attendanceDate);
            nextDay.setDate(nextDay.getDate() + 1);

            let record = await Attendance.findOne({
                employeeId: empId,
                date: { $gte: attendanceDate, $lt: nextDay }
            });

            if (record && record.isLocked) {
                lockedCount++;
                continue;
            }

            if (record) {
                record.status = status;
                if (remarks) record.remarks = remarks;
                record.updatedBy = req.user._id;
                record.markedBy = req.user._id; // Set markedBy on update too
                await record.save();
                updatedCount++;
            } else {
                await Attendance.create({
                    employeeId: empId,
                    date: attendanceDate,
                    status: status,
                    remarks: remarks,
                    markedBy: req.user._id,
                    updatedBy: req.user._id
                });
                updatedCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk update complete. Updated: ${updatedCount}, Skipped (Locked): ${lockedCount}`
        });

    } catch (error) {
        console.error('Bulk attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing bulk attendance',
            error: error.message
        });
    }
};

// @desc    Toggle Lock
// @route   POST /api/v1/attendance/lock
// @access  Private (Admin)
exports.toggleLock = async (req, res) => {
    try {
        const { date, lock } = req.body; // date (day) or month/year? Requirement: "per date/month"
        // Let's support date range or single date.
        // Simplified: Single Date for now as per "per date" UI usually.

        if (!date) return res.status(400).json({ success: false, message: 'Date required' });

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(attendanceDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const result = await Attendance.updateMany(
            { date: { $gte: attendanceDate, $lt: nextDay } },
            { $set: { isLocked: lock } }
        );

        res.status(200).json({
            success: true,
            message: `Attendance ${lock ? 'locked' : 'unlocked'} for ${attendanceDate.toLocaleDateString()}. Records updated: ${result.modifiedCount}`
        });

    } catch (error) {
        console.error('Lock error:', error);
        res.status(500).json({ success: false, message: 'Error toggling lock', error: error.message });
    }
};

// @desc    Generate attendance report
// @route   GET /api/v1/attendance/report
// @access  Private (Admin, HR)
exports.generateReport = async (req, res) => {
    try {
        const { month, year, department } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        // Calculate date range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Get employees
        let employeeQuery = { status: 'active' };
        if (department) {
            employeeQuery.department = department;
        }

        const employees = await Employee.find(employeeQuery);

        // Get attendance for all employees
        const employeeWiseAttendance = [];

        // Calculate working days (excluding Sundays)
        let workingDays = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() !== 0) { // Not Sunday
                workingDays++;
            }
        }

        for (const employee of employees) {
            const attendance = await Attendance.find({
                employeeId: employee._id,
                date: { $gte: startDate, $lte: endDate }
            });

            const presentDays = attendance.filter(a => a.status === 'present').length;
            const absentDays = attendance.filter(a => a.status === 'absent').length;
            const halfDays = attendance.filter(a => a.status === 'half_day').length;
            const leaveDays = attendance.filter(a => a.status === 'leave').length;
            const totalWorkedHours = attendance.reduce((sum, a) => sum + (a.workedHours || 0), 0);

            employeeWiseAttendance.push({
                employeeCode: employee.employeeCode,
                name: `${employee.firstName} ${employee.lastName}`,
                department: employee.department,
                workingDays,
                presentDays,
                absentDays,
                halfDays,
                leaveDays,
                attendancePercentage: ((presentDays + leaveDays) / workingDays * 100).toFixed(2),
                totalWorkedHours: totalWorkedHours.toFixed(2)
            });
        }

        const totalEmployees = employees.length;
        const averageAttendance = totalEmployees > 0
            ? (employeeWiseAttendance.reduce((sum, e) => sum + parseFloat(e.attendancePercentage), 0) / totalEmployees).toFixed(2)
            : 0;

        res.status(200).json({
            success: true,
            data: {
                report: {
                    month: parseInt(month),
                    year: parseInt(year),
                    generatedAt: new Date(),
                    summary: {
                        totalWorkingDays: workingDays,
                        totalEmployees,
                        averageAttendance: parseFloat(averageAttendance)
                    },
                    employeeWiseAttendance
                }
            }
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report',
            error: error.message
        });
    }
};

// @desc    Export attendance as CSV
// @route   GET /api/v1/attendance/export/csv
// @access  Private (Admin, HR)
exports.exportAttendanceCSV = async (req, res) => {
    try {
        const { generateCSV, deleteReport, formatDate } = require('../utils/reportGenerator');
        const { employeeId, startDate, endDate, status, department } = req.query;

        let query = {};

        // Apply filters
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // If department filter, get employees from that department
        if (department) {
            const employees = await Employee.find({ department, status: 'active' });
            const employeeIds = employees.map(emp => emp._id);
            query.employeeId = { $in: employeeIds };
        }

        const attendance = await Attendance.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .sort({ date: -1 });

        // Prepare CSV data
        const csvData = attendance.map(record => ({
            employeeCode: record.employeeId?.employeeCode || 'N/A',
            employeeName: record.employeeId ?
                `${record.employeeId.firstName} ${record.employeeId.lastName}` : 'N/A',
            date: formatDate(record.date),
            checkInTime: record.checkInTime ?
                new Date(record.checkInTime).toLocaleTimeString() : 'N/A',
            checkOutTime: record.checkOutTime ?
                new Date(record.checkOutTime).toLocaleTimeString() : 'N/A',
            workedHours: record.workedHours?.toFixed(2) || '0.00',
            status: record.status,
            remarks: record.remarks || ''
        }));

        const headers = [
            { id: 'employeeCode', title: 'Employee Code' },
            { id: 'employeeName', title: 'Employee Name' },
            { id: 'date', title: 'Date' },
            { id: 'checkInTime', title: 'Check In' },
            { id: 'checkOutTime', title: 'Check Out' },
            { id: 'workedHours', title: 'Hours Worked' },
            { id: 'status', title: 'Status' },
            { id: 'remarks', title: 'Remarks' }
        ];

        const filename = `attendance-${Date.now()}.csv`;
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
            message: 'Error exporting attendance to CSV',
            error: error.message
        });
    }
};

// @desc    Export attendance as PDF
// @route   GET /api/v1/attendance/export/pdf
// @access  Private (Admin, HR)
exports.exportAttendancePDF = async (req, res) => {
    try {
        const { generatePDF, deleteReport, formatDate } = require('../utils/reportGenerator');
        const { employeeId, startDate, endDate, status, department } = req.query;

        let query = {};

        // Apply filters
        if (employeeId) query.employeeId = employeeId;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.date.$lte = end;
            }
        }

        // If department filter, get employees from that department
        if (department) {
            const employees = await Employee.find({ department, status: 'active' });
            const employeeIds = employees.map(emp => emp._id);
            query.employeeId = { $in: employeeIds };
        }

        const attendance = await Attendance.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .sort({ date: -1 });

        // Calculate summary
        const summary = {
            'Total Records': attendance.length,
            'Present Days': attendance.filter(a => a.status === 'present').length,
            'Absent Days': attendance.filter(a => a.status === 'absent').length,
            'Half Days': attendance.filter(a => a.status === 'half_day').length,
            'Leave Days': attendance.filter(a => a.status === 'leave').length
        };

        // Prepare PDF data
        const pdfData = attendance.map(record => ({
            employeeCode: record.employeeId?.employeeCode || 'N/A',
            employeeName: record.employeeId ?
                `${record.employeeId.firstName} ${record.employeeId.lastName}` : 'N/A',
            date: formatDate(record.date),
            checkInTime: record.checkInTime ?
                new Date(record.checkInTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
            checkOutTime: record.checkOutTime ?
                new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                }) : 'N/A',
            workedHours: record.workedHours?.toFixed(1) || '0.0',
            status: record.status
        }));

        const headers = [
            { key: 'employeeCode', title: 'Code', align: 'left' },
            { key: 'employeeName', title: 'Employee', align: 'left' },
            { key: 'date', title: 'Date', align: 'left' },
            { key: 'checkInTime', title: 'Check In', align: 'left' },
            { key: 'checkOutTime', title: 'Check Out', align: 'left' },
            { key: 'workedHours', title: 'Hours', align: 'right' },
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

        const filename = `attendance-report-${Date.now()}.pdf`;
        const filePath = await generatePDF('Attendance Report', headers, pdfData, filename, options);

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
            message: 'Error exporting attendance to PDF',
            error: error.message
        });
    }
};

