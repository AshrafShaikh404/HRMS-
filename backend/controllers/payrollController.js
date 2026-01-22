const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const SalaryStructure = require('../models/SalaryStructure');

// @desc    Generate payroll for a month
// @route   POST /api/v1/payroll/generate
// @access  Private (Admin, HR)
exports.generatePayroll = async (req, res) => {
    try {
        // Validate Month/Year
        const { month, year, department, employeeId } = req.body;
        if (!month || !year) {
            return res.status(400).json({ success: false, message: 'Month and year are required' });
        }

        // 1. Get Employees
        let employeeQuery = { status: 'active' };
        if (employeeId) employeeQuery._id = employeeId;
        else if (department) employeeQuery.department = department;

        const employees = await Employee.find(employeeQuery);
        if (employees.length === 0) {
            return res.status(404).json({ success: false, message: 'No active employees found' });
        }

        // 2. Calculate Month Stats
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const totalDaysInMonth = endDate.getDate();

        // Count Sundays
        let sundaysCount = 0;
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 0) sundaysCount++;
        }
        const publicHolidays = 0; // TODO: Fetch from Holiday model
        const workingDays = totalDaysInMonth - sundaysCount - publicHolidays; // This is 'Potential Working Days'

        const generatedPayrolls = [];
        const errors = [];

        // 3. Process Each Employee
        for (const employee of employees) {
            try {
                // Check Existing Payroll
                const existingPayroll = await Payroll.findOne({ employeeId: employee._id, month, year });

                // RULE: Prevent regeneration if Approved/Locked
                if (existingPayroll && ['approved', 'locked'].includes(existingPayroll.status)) {
                    errors.push({
                        employeeCode: employee.employeeCode,
                        name: `${employee.firstName} ${employee.lastName}`,
                        error: `Payroll is ${existingPayroll.status} and cannot be regenerated.`
                    });
                    continue;
                }

                // Delete existing 'generated' payroll to re-calculate
                if (existingPayroll && existingPayroll.status === 'generated') {
                    await Payroll.findByIdAndDelete(existingPayroll._id);
                }

                // --- DATA GATHERING ---

                // A. Salary Structure (New Logic)
                // Try to find defined structure, fallback to Employee model (Legacy) if missing
                // In a real migration, we would run a script to create structures for all.
                let salaryStruct = await SalaryStructure.findOne({ employeeId: employee._id, isActive: true });

                // Fallback (Logic from previous controller)
                if (!salaryStruct) {
                    const fixedMonthly = employee.salary || 0;
                    salaryStruct = {
                        basicSalary: fixedMonthly * 0.40,
                        hra: fixedMonthly * 0.40 * 0.40, // 40% of Basic? Or separate? 
                        // Previous logic: HRA = 40% of Basic. Basic = 40% of CTC. 
                        // Wait, previous logic: "earnedHra = Math.round((basicSalaryValue * 0.40) * payableRatio)"
                        // So HRA is 40% of Basic.
                        allowances: [],
                        deductions: []
                    };
                    // Note: This fallback is imperfect but keeps legacy working
                }

                // B. Attendance
                const attendance = await Attendance.find({
                    employeeId: employee._id,
                    date: { $gte: startDate, $lte: endDate }
                });

                const presentDays = attendance.filter(a => a.status === 'present').length;
                const halfDays = attendance.filter(a => a.status === 'half_day').length;
                const leaveDays = attendance.filter(a => a.status === 'leave').length; // Marked in attendance as 'leave'

                // C. Approved Leaves (Source of Truth for Paid vs Unpaid)
                const approvedLeaves = await Leave.find({
                    employeeId: employee._id,
                    status: 'approved',
                    fromDate: { $lte: endDate },
                    toDate: { $gte: startDate } // Overlapping
                });

                // Calculate Paid vs Unpaid strictly from Leave records intersecting this month
                // (Simplified: assuming leave record dates fall within month for now, or we iterate days)
                // Better approach: Count days from leave records that fall in this month
                let paidLeavesCount = 0;
                let unpaidLeavesCount = 0;

                // Simple iteration for accuracy
                for (let d = 1; d <= totalDaysInMonth; d++) {
                    const currentDay = new Date(year, month - 1, d);
                    const dayString = currentDay.toISOString().split('T')[0];

                    // Check if this day is covered by any approved leave
                    for (const leave of approvedLeaves) {
                        const lStart = new Date(leave.fromDate);
                        const lEnd = new Date(leave.toDate);
                        if (currentDay >= lStart && currentDay <= lEnd) {
                            if (leave.leaveType === 'unpaid') unpaidLeavesCount++;
                            else paidLeavesCount++;
                            break; // Counted for this day
                        }
                    }
                }

                // --- CALCULATION ENGINE ---

                // 1. Payable Days
                // Formula: Total Days - Unpaid Leaves
                // Note: Absent days in Attendance that are NOT applied leaves are also Loss of Pay?
                // Usually: Payable = TotalDays - (UnpaidLeave + UnauthorizedAbsent)
                // For this request: "Payable Days = Total Days - Unpaid Leaves"
                // But we must account for 'Absent' in attendance which implies 0 pay.
                // So: LossOfPayDays = UnpaidLeavesCount + (Attendance.absentDays?)
                // Let's stick to the prompt's implied logic but make it robust.

                // If we use "Total Days" (30/31) as base, we pay for Sundays/Holidays unless specified.
                // Approach: We pay for everything EXCEPT Unpaid Leaves and Absents.

                // Unaccounted days? (Not present, not absent, not leave, not holiday/sunday) -> Usually considered Present or Ignore?
                // Safe bet: Payable = TotalDaysInMonth - UnpaidLeavesCount - UnapprovedAbsence

                // Let's refine Unpaid:
                // Unpaid = Explicit 'unpaid' Leave + Days marked 'absent' in Attendance
                const absentInAttendance = attendance.filter(a => a.status === 'absent').length;
                const totalUnpaidDays = unpaidLeavesCount + absentInAttendance;

                const payableDays = totalDaysInMonth - totalUnpaidDays;

                // 2. Gross Salary (Monthly Fixed)
                // We sum up components from SalaryStructure
                const baseBasic = salaryStruct.basicSalary || 0;
                const baseHRA = salaryStruct.hra || 0;
                const baseAllowances = salaryStruct.allowances ? salaryStruct.allowances.reduce((acc, curr) => acc + curr.amount, 0) : 0;

                const fullGross = baseBasic + baseHRA + baseAllowances;

                // 3. Per Day Salary
                const perDaySalary = fullGross / totalDaysInMonth;

                // 4. Earnings (Prorated)
                // Actually, standard HRMS often deducts LOP rather than prorating everything.
                // Prompt: "Net Salary = Gross - Total Deductions - Loss of Pay"
                // Loss of Pay = PerDaySalary * UnpaidLeaves

                const lossOfPayAmount = Math.round(perDaySalary * totalUnpaidDays);
                const earnedGross = Math.round(fullGross - lossOfPayAmount);

                // Prorate components for record keeping (Optional but good)
                const ratio = payableDays / totalDaysInMonth;
                const earnedBasic = Math.round(baseBasic * ratio);
                const earnedHRA = Math.round(baseHRA * ratio);

                // 5. Deductions
                // A. Statutory (PF, ESI) - usually on EARNED basic/gross
                let pf = 0;
                let esi = 0;
                // If structure has explicit deduction overrides, use them? 
                // Creating a map of explicit deductions
                let structureDeductions = 0;
                if (salaryStruct.deductions) {
                    structureDeductions = salaryStruct.deductions.reduce((acc, curr) => acc + curr.amount, 0);
                }

                // If PF/ESI are not in structure array, calculate them?
                // For Phase 1, let's look for them in 'deductions' array by name, if not found, auto-calc?
                // Or just assume `deductions` array in SalaryStructure allows manual overrides.
                // Let's auto-calc statutory if not present, for safety.

                // But wait, Structure model has `deductions` array.
                // We should assume that represents the FIXED deductions.
                // Statutory often varies by earned amount.
                // Let's stick to: PF = 12% of Earned Basic (if eligible).
                if (employee.isPfEligible !== false) {
                    pf = Math.round(earnedBasic * 0.12);
                }

                // ESI = 0.75% of Gross (if Gross <= 21000)
                if (employee.isEsiEligible !== false && earnedGross <= 21000) {
                    esi = Math.round(earnedGross * 0.0075);
                }

                const pt = 200; // Professional Tax
                const it = employee.taxDeduction || 0;

                const totalCalculatedDeductions = pf + esi + pt + it + structureDeductions;

                // 6. Net Salary
                const netSalary = earnedGross - totalCalculatedDeductions;

                // Create Record
                const payroll = await Payroll.create({
                    employeeId: employee._id,
                    month,
                    year,
                    totalDaysInMonth,
                    workingDays,
                    presentDays, // Days physically present
                    absentDays: absentInAttendance,
                    paidLeaves: paidLeavesCount,
                    unpaidLeaves: unpaidLeavesCount,
                    unpaidLeaveDeduction: lossOfPayAmount,
                    payableDays,

                    // Financials
                    basicSalary: earnedBasic, // Record earned amounts
                    hra: earnedHRA,
                    grossSalary: earnedGross,

                    pfDeduction: pf,
                    esiDeduction: esi,
                    professionalTax: pt,
                    incomeTax: it,
                    deductions: structureDeductions, // Extra fixed deductions
                    totalDeductions: totalCalculatedDeductions,

                    netSalary: Math.max(0, netSalary), // No negative salary

                    status: 'generated'
                    // generatedAt default
                });

                generatedPayrolls.push({
                    employeeCode: employee.employeeCode,
                    name: `${employee.firstName} ${employee.lastName}`,
                    payrollId: payroll._id,
                    netSalary: payroll.netSalary,
                    status: payroll.status
                });

            } catch (err) {
                console.error(`Error processing employee ${employee.employeeCode}:`, err);
                errors.push({
                    employeeCode: employee.employeeCode || 'UNKNOWN',
                    name: `${employee.firstName} ${employee.lastName}`,
                    error: err.message
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Payroll generation process completed',
            data: {
                generated: generatedPayrolls,
                errors,
                summary: {
                    totalEmployees: employees.length,
                    successfullyGenerated: generatedPayrolls.length,
                    failed: errors.length
                }
            }
        });

    } catch (error) {
        console.error('Generate payroll error:', error);
        res.status(500).json({ success: false, message: 'Server error generating payroll', error: error.message });
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

// @desc    Approve payroll (HR/Admin)
// @route   PUT /api/v1/payroll/:id/approve
// @access  Private (Admin, HR)
exports.approvePayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

        if (payroll.status !== 'generated') {
            return res.status(400).json({ success: false, message: `Cannot approve payroll with status: ${payroll.status}` });
        }

        payroll.status = 'approved';
        payroll.approvedAt = new Date();
        // Record who approved it if we had that field, usually req.user._id

        await payroll.save();

        res.status(200).json({
            success: true,
            message: 'Payroll approved successfully',
            data: payroll
        });
    } catch (error) {
        console.error('Approve payroll error:', error);
        res.status(500).json({ success: false, message: 'Error approving payroll', error: error.message });
    }
};

// @desc    Lock payroll (Finalize)
// @route   PUT /api/v1/payroll/:id/lock
// @access  Private (Admin, HR)
exports.lockPayroll = async (req, res) => {
    try {
        const payroll = await Payroll.findById(req.params.id);
        if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

        // Can only lock if approved
        if (payroll.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Payroll must be approved before locking' });
        }

        payroll.status = 'locked';
        // payroll.lockedAt = new Date(); // If we had this field

        await payroll.save();

        res.status(200).json({
            success: true,
            message: 'Payroll locked successfully',
            data: payroll
        });
    } catch (error) {
        console.error('Lock payroll error:', error);
        res.status(500).json({ success: false, message: 'Error locking payroll', error: error.message });
    }
};

// @desc    Download Payslip PDF
// @route   GET /api/v1/payroll/:id/download
// @access  Private
exports.downloadPayslip = async (req, res) => {
    try {
        const { generatePayslipPDF } = require('../utils/payslipGenerator');
        const payroll = await Payroll.findById(req.params.id)
            .populate('employeeId', 'firstName lastName employeeCode department designation joinDate bankAccountNo userId');

        if (!payroll) return res.status(404).json({ success: false, message: 'Payroll not found' });

        // Authorization Check
        let userRole = req.user.role;
        if (typeof userRole === 'object' && userRole !== null) {
            userRole = userRole.name;
        }
        userRole = userRole?.toLowerCase();

        console.log(`Download attempt by ${req.user.email} (Role: ${userRole}) for Payroll ID: ${req.params.id}`);

        if (userRole === 'employee') {
            const userId = payroll.employeeId.userId ? payroll.employeeId.userId.toString() : '';
            console.log(`Checking Ownership: Employee UserID=${userId}, Current UserID=${req.user._id}`);
            if (userId !== req.user._id.toString()) {
                console.warn(`Unauthorized access attempt by ${req.user.email}`);
                return res.status(403).json({ success: false, message: 'Not authorized to view this payslip' });
            }
        }

        // Generate PDF
        console.log(`Generating PDF for ${payroll.employeeId.employeeCode}...`);
        const filePath = await generatePayslipPDF(payroll);
        const filename = `Payslip_${payroll.employeeId.employeeCode}_${payroll.month}_${payroll.year}.pdf`;

        // Send file
        console.log(`Sending file: ${filePath}`);
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('File download error:', err);
            }
            // Delete temp file after download
            const fs = require('fs');
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });

    } catch (error) {
        console.error('Download payslip error:', error);
        res.status(500).json({ success: false, message: 'Error downloading payslip', error: error.message });
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

