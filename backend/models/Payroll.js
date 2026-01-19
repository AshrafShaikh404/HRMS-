const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true,
        min: 2000
    },

    // Calculation Basis
    totalDaysInMonth: {
        type: Number,
        required: true
    },
    publicHolidays: {
        type: Number,
        default: 0
    },
    sundaysCount: {
        type: Number,
        default: 0
    },
    workingDays: {
        type: Number,
        required: true
    },
    presentDays: {
        type: Number,
        default: 0
    },
    absentDays: {
        type: Number,
        default: 0
    },
    paidLeaves: {
        type: Number,
        default: 0
    },
    unpaidLeaves: {
        type: Number,
        default: 0
    },
    payableDays: {
        type: Number,
        required: true
    },

    // Salary Calculation
    basicSalary: {
        type: Number,
        required: true,
        min: 0
    },
    hra: {
        type: Number,
        default: 0
    },
    da: {
        type: Number,
        default: 0
    },
    grossSalary: {
        type: Number,
        required: true,
        min: 0
    },
    deductions: { // Keeping for backward compatibility/sum
        type: Number,
        default: 0
    },
    pfDeduction: { type: Number, default: 0 },
    esiDeduction: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 },
    incomeTax: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    netSalary: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ['generated', 'approved', 'released', 'paid'],
        default: 'generated'
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    approvedAt: {
        type: Date
    },
    paidAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Compound index to ensure one payroll per employee per month
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ month: 1, year: 1 });
payrollSchema.index({ status: 1 });

module.exports = mongoose.model('Payroll', payrollSchema);
