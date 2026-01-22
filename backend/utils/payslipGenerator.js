const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePayslipPDF = async (payroll, res) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });

            // Setup response headers for direct download/view
            const filename = `Payslip_${payroll.employeeId.employeeCode}_${payroll.month}_${payroll.year}.pdf`;

            // Pipe to response directly? Or save to file? 
            // The controller usually expects a file path or stream.
            // Let's create a temporary file path.
            const reportDir = path.join(__dirname, '../reports');
            if (!fs.existsSync(reportDir)) {
                fs.mkdirSync(reportDir, { recursive: true });
            }
            const filePath = path.join(reportDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // --- PDF CONTENT ---

            // Header
            doc.fillColor('#333333').fontSize(22).font('Helvetica-Bold').text('ASVHR', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('123 Corporate Park, Tech City, India', { align: 'center' });
            doc.moveDown(0.5);
            doc.rect(50, doc.y, 500, 2).fill('#1976d2');
            doc.moveDown(1);

            doc.fillColor('black').fontSize(16).font('Helvetica-Bold').text('PAYSLIP', { align: 'center', underline: false });
            doc.fontSize(12).font('Helvetica').text(`For the month of ${getMonthName(payroll.month)} ${payroll.year}`, { align: 'center' });
            doc.moveDown(1.5);

            // Employee Details Box
            const detailsY = doc.y;
            doc.rect(50, detailsY, 500, 90).stroke();
            doc.fontSize(10);

            const leftCol = 65;
            const rightCol = 310;
            let currentLineY = detailsY + 15;

            doc.font('Helvetica-Bold').text('Employee Name:', leftCol, currentLineY);
            doc.font('Helvetica').text(`${payroll.employeeId.firstName} ${payroll.employeeId.lastName}`, leftCol + 85, currentLineY);

            doc.font('Helvetica-Bold').text('Employee Code:', rightCol, currentLineY);
            doc.font('Helvetica').text(`${payroll.employeeId.employeeCode}`, rightCol + 85, currentLineY);

            currentLineY += 20;
            doc.font('Helvetica-Bold').text('Department:', leftCol, currentLineY);
            doc.font('Helvetica').text(`${payroll.employeeId.department || 'N/A'}`, leftCol + 85, currentLineY);

            doc.font('Helvetica-Bold').text('Designation:', rightCol, currentLineY);
            doc.font('Helvetica').text(`${payroll.employeeId.designation || 'N/A'}`, rightCol + 85, currentLineY);

            currentLineY += 20;
            doc.font('Helvetica-Bold').text('Date of Joining:', leftCol, currentLineY);
            doc.font('Helvetica').text(`${new Date(payroll.employeeId.joinDate).toLocaleDateString()}`, leftCol + 85, currentLineY);

            doc.font('Helvetica-Bold').text('Bank Account:', rightCol, currentLineY);
            doc.font('Helvetica').text(`${payroll.employeeId.bankAccountNo || 'N/A'}`, rightCol + 85, currentLineY);

            doc.moveDown(3.5);

            // Attendance Summary
            doc.font('Helvetica-Bold').fontSize(11).text('Attendance Details:', 50, doc.y, { underline: true });
            doc.moveDown(0.5);

            const attendanceY = doc.y;
            doc.fontSize(10).font('Helvetica');
            doc.text(`Total Days: ${payroll.totalDaysInMonth}`, 60, attendanceY);
            doc.text(`Working Days: ${payroll.workingDays}`, 180, attendanceY);
            doc.text(`Payable Days: ${payroll.payableDays}`, 300, attendanceY);
            doc.text(`L.O.P Days: ${payroll.unpaidLeaves + payroll.absentDays}`, 420, attendanceY);

            doc.moveDown(2.5);

            // Earnings & Deductions Table
            const tableTop = doc.y;
            const colWidths = {
                desc: 170,
                amount: 80
            };
            const col1 = 50;
            const col2 = col1 + colWidths.desc;
            const col3 = col2 + colWidths.amount;
            const col4 = col3 + colWidths.desc;

            // Shared Line Width
            doc.lineWidth(0.5);

            // --- HEADERS ---
            const headerHeight = 25;

            // Header Backgrounds
            doc.rect(col1, tableTop, colWidths.desc, headerHeight).fill('#f0f0f0');
            doc.rect(col3, tableTop, colWidths.desc, headerHeight).fill('#f0f0f0');

            // Header Borders
            doc.strokeColor('#000000');
            doc.rect(col1, tableTop, colWidths.desc, headerHeight).stroke(); // Earnings
            doc.rect(col2, tableTop, colWidths.amount, headerHeight).stroke(); // Amount
            doc.rect(col3, tableTop, colWidths.desc, headerHeight).stroke(); // Deductions
            doc.rect(col4, tableTop, colWidths.amount, headerHeight).stroke(); // Amount

            // Header Text
            doc.font('Helvetica-Bold').fontSize(10).fillColor('black');
            doc.text('EARNINGS', col1 + 10, tableTop + 8);
            doc.text('AMOUNT', col2, tableTop + 8, { width: colWidths.amount, align: 'center' });
            doc.text('DEDUCTIONS', col3 + 10, tableTop + 8);
            doc.text('AMOUNT', col4, tableTop + 8, { width: colWidths.amount, align: 'center' });

            // --- DATA ROWS ---
            doc.font('Helvetica').fontSize(10).fillColor('black');
            let currentY = tableTop + headerHeight;
            const rowHeight = 25;

            const earnings = [
                { label: 'Basic Salary', amount: payroll.basicSalary },
                { label: 'HRA', amount: payroll.hra },
                { label: 'Other Allowances', amount: payroll.grossSalary - payroll.basicSalary - payroll.hra },
            ];

            const deductions = [
                { label: 'Provident Fund', amount: payroll.pfDeduction },
                { label: 'Professional Tax', amount: payroll.professionalTax },
                { label: 'Income Tax', amount: payroll.incomeTax },
                { label: 'ESI', amount: payroll.esiDeduction },
                { label: 'Loss of Pay', amount: payroll.unpaidLeaveDeduction },
                { label: 'Other Deductions', amount: Math.max(0, payroll.totalDeductions - (payroll.pfDeduction + payroll.esiDeduction + payroll.professionalTax + payroll.incomeTax)) }
            ];

            const maxRows = Math.max(earnings.length, deductions.length);

            // Draw Rows
            for (let i = 0; i < maxRows; i++) {
                const earn = earnings[i] || { label: '', amount: null };
                const ded = deductions[i] || { label: '', amount: null };

                // Draw Rectangles (to ensure borders share lines perfectly)
                doc.rect(col1, currentY, colWidths.desc, rowHeight).stroke();
                doc.rect(col2, currentY, colWidths.amount, rowHeight).stroke();
                doc.rect(col3, currentY, colWidths.desc, rowHeight).stroke();
                doc.rect(col4, currentY, colWidths.amount, rowHeight).stroke();

                // Text Content
                if (earn.label) {
                    doc.text(earn.label, col1 + 10, currentY + 8);
                    doc.text(formatCurrency(earn.amount), col2 - 5, currentY + 8, { width: colWidths.amount, align: 'right' });
                }

                if (ded.label) {
                    doc.text(ded.label, col3 + 10, currentY + 8);
                    doc.text(formatCurrency(ded.amount), col4 - 5, currentY + 8, { width: colWidths.amount, align: 'right' });
                }

                currentY += rowHeight;
            }

            // --- TOTALS ROW ---
            doc.font('Helvetica-Bold');

            // Totals Background
            doc.rect(col1, currentY, colWidths.desc, rowHeight).fill('#f9f9f9');
            doc.rect(col3, currentY, colWidths.desc, rowHeight).fill('#f9f9f9');

            // Totals Borders
            doc.strokeColor('black');
            doc.rect(col1, currentY, colWidths.desc, rowHeight).stroke();
            doc.rect(col2, currentY, colWidths.amount, rowHeight).stroke();
            doc.rect(col3, currentY, colWidths.desc, rowHeight).stroke();
            doc.rect(col4, currentY, colWidths.amount, rowHeight).stroke();

            // Totals Text
            doc.fillColor('black');
            doc.text('Total Earnings', col1 + 10, currentY + 8);
            doc.text(formatCurrency(payroll.grossSalary), col2 - 5, currentY + 8, { width: colWidths.amount, align: 'right' });

            doc.text('Total Deductions', col3 + 10, currentY + 8);
            doc.text(formatCurrency(payroll.totalDeductions + payroll.unpaidLeaveDeduction), col4 - 5, currentY + 8, { width: colWidths.amount, align: 'right' });

            currentY += rowHeight + 25;

            // Net Pay
            doc.rect(50, currentY, 500, 40).fill('#e3f2fd').stroke();
            doc.fillColor('black').fontSize(12).font('Helvetica-Bold').text(`NET PAYABLE: ${formatCurrency(payroll.netSalary)}`, 70, currentY + 14);
            doc.fontSize(10).font('Helvetica').text(`(${numberToWords(Math.round(payroll.netSalary))} Only)`, 320, currentY + 15);

            // Footer
            const footerText = 'This is a computer-generated payslip and does not require a signature.';
            doc.fontSize(8).fillColor('#777777').text(footerText, 50, 720, { align: 'center', width: 500 });

            // End PDF
            doc.end();

            stream.on('finish', () => {
                resolve(filePath);
            });

            stream.on('error', (err) => {
                reject(err);
            });

        } catch (error) {
            reject(error);
        }
    });
};

const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
};

const formatCurrency = (amount) => {
    return 'Rs. ' + (Number(amount) || 0).toLocaleString('en-IN');
};

const numberToWords = (num) => {
    // Simple placeholder - ideally use a library like 'number-to-words'
    return num + '';
};

module.exports = { generatePayslipPDF };
