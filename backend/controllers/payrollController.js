const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

// @desc    Generate payroll for a month
// @route   POST /api/v1/payroll/generate
// @access  Private (Admin, HR)
exports.generatePayroll = async (req, res) => {
    try {
        const { month, year, department, employeeId } = req.body;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        // Get active employees
        let employeeQuery = { status: 'active' };
        if (employeeId) {
            employeeQuery._id = employeeId;
        } else if (department) {
            employeeQuery.department = department;
        }

        const employees = await Employee.find(employeeQuery);

        if (employees.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active employees found'
            });
        }

        // Calculate month details
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const totalDaysInMonth = endDate.getDate();

        // Count Sundays and holidays
        let sundaysCount = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) sundaysCount++;
        }

        const publicHolidays = 0; // Can be configured later
        const workingDays = totalDaysInMonth - sundaysCount - publicHolidays;

        const generatedPayrolls = [];
        const errors = [];

        for (const employee of employees) {
            try {
                // Check if payroll already exists
                const existingPayroll = await Payroll.findOne({
                    employeeId: employee._id,
                    month,
                    year
                });

                if (existingPayroll) {
                    errors.push({
                        employeeCode: employee.employeeCode,
                        name: `${employee.firstName} ${employee.lastName}`,
                        error: 'Payroll already generated'
                    });
                    continue;
                }

                // Get attendance data
                const attendance = await Attendance.find({
                    employeeId: employee._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                const presentDays = attendance.filter(a => a.status === 'present').length;
                const halfDays = attendance.filter(a => a.status === 'half_day').length;
                const absentDays = attendance.filter(a => a.status === 'absent').length;
                const leaveDays = attendance.filter(a => a.status === 'leave').length;

                // Get approved leaves
                const approvedLeaves = await Leave.find({
                    employeeId: employee._id,
                    status: 'approved',
                    fromDate: { $gte: startDate },
                    toDate: { $lte: endDate }
                });

                const paidLeaves = approvedLeaves
                    .filter(l => l.leaveType !== 'unpaid')
                    .reduce((sum, l) => sum + l.numberOfDays, 0);

                const unpaidLeaves = approvedLeaves
                    .filter(l => l.leaveType === 'unpaid')
                    .reduce((sum, l) => sum + l.numberOfDays, 0);

                // Calculate payable days
                const payableDays = presentDays + (halfDays * 0.5) + paidLeaves;

                // Calculate salary components
                // Assumption: Basic is 40% of fixed Monthly Salary (CTC)
                // This is a simplification. Usually CTC structure is defined per employee.
                // We use the 'salary' field as the fixed monthly gross entitlement for calculation basis.

                const fixedMonthlySalary = employee.salary;
                const basicSalaryValue = fixedMonthlySalary * 0.40;

                // Calculate payable amounts based on days worked
                const payableRatio = payableDays / workingDays;

                // Actual Earnings for the month
                const earnedBasic = Math.round(basicSalaryValue * payableRatio);
                const earnedHra = Math.round((basicSalaryValue * 0.40) * payableRatio); // HRA 40% of Basic

                // Other allowances make up the rest of the salary
                const earnedOtherAllowances = Math.round((fixedMonthlySalary - basicSalaryValue - (basicSalaryValue * 0.40)) * payableRatio);

                const grossSalary = earnedBasic + earnedHra + earnedOtherAllowances;

                // Statutory Deductions
                let pfDeduction = 0;
                if (employee.isPfEligible !== false) { // Default to true if undefined
                    pfDeduction = Math.round(earnedBasic * 0.12);
                }

                let esiDeduction = 0;
                // ESI is on Gross Salary, applicable if Gross <= 21000 (Statutory limit)
                // However, we check if employee is eligible. Usually based on Gross caps but can be voluntary.
                if (employee.isEsiEligible !== false && grossSalary <= 21000) {
                    esiDeduction = Math.round(grossSalary * 0.0075);
                }

                let professionalTax = 200; // Flat 200 for simplicity (varies by state)

                const incomeTax = employee.taxDeduction || 0;

                const totalDeductions = pfDeduction + esiDeduction + professionalTax + incomeTax;
                const netSalary = grossSalary - totalDeductions;

                // Create payroll record
                const payroll = await Payroll.create({
                    employeeId: employee._id,
                    month,
                    year,
                    totalDaysInMonth,
                    publicHolidays,
                    sundaysCount,
                    workingDays,
                    presentDays,
                    absentDays,
                    paidLeaves,
                    unpaidLeaves,
                    payableDays,
                    basicSalary: earnedBasic,
                    hra: earnedHra,
                    da: 0, // Not explicitly calculated for now
                    grossSalary,

                    // Deductions
                    deductions: totalDeductions, // Sum for backward compat
                    pfDeduction,
                    esiDeduction,
                    professionalTax,
                    incomeTax,
                    totalDeductions,

                    netSalary,
                    status: 'generated'
                });

                generatedPayrolls.push({
                    employeeCode: employee.employeeCode,
                    name: `${employee.firstName} ${employee.lastName}`,
                    payrollId: payroll._id,
                    netSalary: payroll.netSalary
                });
            } catch (error) {
                errors.push({
                    employeeCode: employee.employeeCode,
                    name: `${employee.firstName} ${employee.lastName}`,
                    error: error.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Payroll generated successfully',
            data: {
                generated: generatedPayrolls,
                errors,
                summary: {
                    totalEmployees: employees.length,
                    successfullyGenerated: generatedPayrolls.length,
                    failed: errors.length,
                    totalDisbursement: generatedPayrolls.reduce((sum, p) => sum + p.netSalary, 0)
                }
            }
        });
    } catch (error) {
        console.error('Generate payroll error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating payroll',
            error: error.message
        });
    }
};

// @desc    Get payslips for a month
// @route   GET /api/v1/payroll/payslips/:month/:year
// @access  Private (Admin, HR)
exports.getPayslips = async (req, res) => {
    try {
        const { month, year } = req.params;

        const payrolls = await Payroll.find({ month: parseInt(month), year: parseInt(year) })
            .populate('employeeId', 'firstName lastName employeeCode department designation')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: payrolls
        });
    } catch (error) {
        console.error('Get payslips error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payslips',
            error: error.message
        });
    }
};

// @desc    Get single payslip
// @route   GET /api/v1/payroll/payslip/:employeeId/:month/:year
// @access  Private
exports.getPayslip = async (req, res) => {
    try {
        const { employeeId, month, year } = req.params;

        // Check authorization
        if (req.user.role === 'employee') {
            const employee = await Employee.findOne({ userId: req.user._id });
            if (!employee || employee._id.toString() !== employeeId) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this payslip'
                });
            }
        }

        const payroll = await Payroll.findOne({
            employeeId,
            month: parseInt(month),
            year: parseInt(year)
        }).populate('employeeId', 'firstName lastName employeeCode department designation email');

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payslip not found'
            });
        }

        res.status(200).json({
            success: true,
            data: payroll
        });
    } catch (error) {
        console.error('Get payslip error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payslip',
            error: error.message
        });
    }
};

// @desc    Generate payroll reports
// @route   GET /api/v1/payroll/reports
// @access  Private (Admin, HR)
exports.getPayrollReports = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        const payrolls = await Payroll.find({
            month: parseInt(month),
            year: parseInt(year)
        }).populate('employeeId', 'firstName lastName employeeCode department');

        // Department-wise analysis
        const departmentWise = {};
        payrolls.forEach(p => {
            const dept = p.employeeId.department;
            if (!departmentWise[dept]) {
                departmentWise[dept] = {
                    department: dept,
                    employeeCount: 0,
                    totalDisbursement: 0
                };
            }
            departmentWise[dept].employeeCount++;
            departmentWise[dept].totalDisbursement += p.netSalary;
        });

        const totalDisbursement = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    month: parseInt(month),
                    year: parseInt(year),
                    totalEmployees: payrolls.length,
                    totalDisbursement,
                    averageSalary: payrolls.length > 0 ? Math.round(totalDisbursement / payrolls.length) : 0
                },
                departmentWise: Object.values(departmentWise),
                employeeWise: payrolls.map(p => ({
                    employeeCode: p.employeeId.employeeCode,
                    name: `${p.employeeId.firstName} ${p.employeeId.lastName}`,
                    department: p.employeeId.department,
                    workingDays: p.workingDays,
                    payableDays: p.payableDays,
                    basicSalary: p.basicSalary,
                    grossSalary: p.grossSalary,
                    netSalary: p.netSalary,
                    status: p.status
                }))
            }
        });
    } catch (error) {
        console.error('Get payroll reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating payroll reports',
            error: error.message
        });
    }
};

// @desc    Update payroll status
// @route   PUT /api/v1/payroll/:id/status
// @access  Private (Admin, HR)
exports.updatePayrollStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'released', 'paid'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const payroll = await Payroll.findById(req.params.id);

        if (!payroll) {
            return res.status(404).json({
                success: false,
                message: 'Payroll not found'
            });
        }

        payroll.status = status;
        if (status === 'approved') {
            payroll.approvedAt = new Date();
        } else if (status === 'paid') {
            payroll.paidAt = new Date();
        }

        await payroll.save();

        res.status(200).json({
            success: true,
            message: `Payroll status updated to ${status}`,
            data: payroll
        });
    } catch (error) {
        console.error('Update payroll status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating payroll status',
            error: error.message
        });
    }
};

// @desc    Export payroll as CSV
// @route   GET /api/v1/payroll/export/csv
// @access  Private (Admin, HR)
exports.exportPayrollCSV = async (req, res) => {
    try {
        const { generateCSV, deleteReport, formatCurrency } = require('../utils/reportGenerator');
        const { month, year, department } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        let query = {
            month: parseInt(month),
            year: parseInt(year)
        };

        const payrolls = await Payroll.find(query)
            .populate('employeeId', 'firstName lastName employeeCode department designation')
            .sort({ 'employeeId.employeeCode': 1 });

        // Filter by department if specified
        let filteredPayrolls = payrolls;
        if (department) {
            filteredPayrolls = payrolls.filter(p =>
                p.employeeId && p.employeeId.department === department
            );
        }

        // Prepare CSV data
        const csvData = filteredPayrolls.map(payroll => ({
            employeeCode: payroll.employeeId?.employeeCode || 'N/A',
            employeeName: payroll.employeeId ?
                `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}` : 'N/A',
            department: payroll.employeeId?.department || 'N/A',
            designation: payroll.employeeId?.designation || 'N/A',
            month: payroll.month,
            year: payroll.year,
            workingDays: payroll.workingDays,
            presentDays: payroll.presentDays,
            absentDays: payroll.absentDays,
            paidLeaves: payroll.paidLeaves,
            unpaidLeaves: payroll.unpaidLeaves,
            payableDays: payroll.payableDays,
            basicSalary: payroll.basicSalary?.toFixed(2) || '0.00',
            grossSalary: payroll.grossSalary?.toFixed(2) || '0.00',
            deductions: payroll.deductions?.toFixed(2) || '0.00',
            netSalary: payroll.netSalary?.toFixed(2) || '0.00',
            status: payroll.status
        }));

        const headers = [
            { id: 'employeeCode', title: 'Employee Code' },
            { id: 'employeeName', title: 'Employee Name' },
            { id: 'department', title: 'Department' },
            { id: 'designation', title: 'Designation' },
            { id: 'month', title: 'Month' },
            { id: 'year', title: 'Year' },
            { id: 'workingDays', title: 'Working Days' },
            { id: 'presentDays', title: 'Present Days' },
            { id: 'absentDays', title: 'Absent Days' },
            { id: 'paidLeaves', title: 'Paid Leaves' },
            { id: 'unpaidLeaves', title: 'Unpaid Leaves' },
            { id: 'payableDays', title: 'Payable Days' },
            { id: 'basicSalary', title: 'Basic Salary' },
            { id: 'grossSalary', title: 'Gross Salary' },
            { id: 'deductions', title: 'Deductions' },
            { id: 'netSalary', title: 'Net Salary' },
            { id: 'status', title: 'Status' }
        ];

        const filename = `payroll-${month}-${year}-${Date.now()}.csv`;
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
            message: 'Error exporting payroll to CSV',
            error: error.message
        });
    }
};

// @desc    Export payroll as PDF
// @route   GET /api/v1/payroll/export/pdf
// @access  Private (Admin, HR)
exports.exportPayrollPDF = async (req, res) => {
    try {
        const { generatePDF, deleteReport, formatCurrency } = require('../utils/reportGenerator');
        const { month, year, department } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'Month and year are required'
            });
        }

        let query = {
            month: parseInt(month),
            year: parseInt(year)
        };

        const payrolls = await Payroll.find(query)
            .populate('employeeId', 'firstName lastName employeeCode department designation')
            .sort({ 'employeeId.employeeCode': 1 });

        // Filter by department if specified
        let filteredPayrolls = payrolls;
        if (department) {
            filteredPayrolls = payrolls.filter(p =>
                p.employeeId && p.employeeId.department === department
            );
        }

        // Calculate summary
        const totalGross = filteredPayrolls.reduce((sum, p) => sum + (p.grossSalary || 0), 0);
        const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + (p.deductions || 0), 0);
        const totalNet = filteredPayrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);

        const summary = {
            'Total Employees': filteredPayrolls.length,
            'Total Gross Salary': formatCurrency(totalGross),
            'Total Deductions': formatCurrency(totalDeductions),
            'Total Net Payroll': formatCurrency(totalNet),
            'Average Salary': formatCurrency(filteredPayrolls.length > 0 ? totalNet / filteredPayrolls.length : 0)
        };

        // Prepare PDF data
        const pdfData = filteredPayrolls.map(payroll => ({
            employeeCode: payroll.employeeId?.employeeCode || 'N/A',
            employeeName: payroll.employeeId ?
                `${payroll.employeeId.firstName} ${payroll.employeeId.lastName}` : 'N/A',
            department: payroll.employeeId?.department || 'N/A',
            payableDays: payroll.payableDays?.toFixed(1) || '0.0',
            basicSalary: formatCurrency(payroll.basicSalary || 0),
            grossSalary: formatCurrency(payroll.grossSalary || 0),
            deductions: formatCurrency(payroll.deductions || 0),
            netSalary: formatCurrency(payroll.netSalary || 0)
        }));

        const headers = [
            { key: 'employeeCode', title: 'Code', align: 'left' },
            { key: 'employeeName', title: 'Employee', align: 'left' },
            { key: 'department', title: 'Dept', align: 'left' },
            { key: 'payableDays', title: 'Days', align: 'right' },
            { key: 'basicSalary', title: 'Basic', align: 'right' },
            { key: 'grossSalary', title: 'Gross', align: 'right' },
            { key: 'deductions', title: 'Deduct', align: 'right' },
            { key: 'netSalary', title: 'Net', align: 'right' }
        ];

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const dateRange = `Period: ${monthNames[parseInt(month) - 1]} ${year}`;

        const options = {
            companyName: 'HRMS - Human Resource Management System',
            dateRange: department ? `${dateRange} | Department: ${department}` : dateRange,
            summary
        };

        const filename = `payroll-report-${month}-${year}-${Date.now()}.pdf`;
        const filePath = await generatePDF('Payroll Report', headers, pdfData, filename, options);

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
            message: 'Error exporting payroll to PDF',
            error: error.message
        });
    }
};

