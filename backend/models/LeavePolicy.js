const mongoose = require('mongoose');

const leavePolicySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Policy name is required'],
        trim: true
    },
    description: String,
    leaveTypes: [{
        leaveType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LeaveType',
            required: true
        },
        quota: {
            type: Number,
            required: true,
            min: 0
        },
        accrualFrequency: {
            type: String,
            enum: ['yearly', 'monthly', 'quarterly'],
            default: 'yearly'
        }
    }],
    // For Phase 1: simple assignment logic. 
    // We will assign this policy ID to the Employee model directly or manage it here.
    // Let's keep it simple: One global policy or manually assigned.
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeavePolicy', leavePolicySchema);
