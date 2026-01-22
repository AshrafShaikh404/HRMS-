const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    leaveType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaveType',
        required: true
    },
    year: {
        type: Number,
        required: true
    },

    // Balance Breakdown
    totalAccrued: { type: Number, default: 0 }, // Total days credited (start + accruals)
    used: { type: Number, default: 0 },         // Approved leaves
    pending: { type: Number, default: 0 },      // Applied but not approved yet

    // Audit Trail
    history: [{
        action: {
            type: String,
            enum: ['INITIAL_ALLOCATION', 'ACCRUAL', 'USAGE', 'ADJUSTMENT', 'CARRY_FORWARD', 'REJECTION_REVERSAL', 'CANCELLATION']
        },
        days: Number, // +ve for credit, -ve for debit
        date: { type: Date, default: Date.now },
        reason: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true
});

// Compound index to ensure one balance record per type per employee per year
leaveBalanceSchema.index({ employeeId: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
