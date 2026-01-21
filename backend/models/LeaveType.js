const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Leave type name is required'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Leave code is required'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    isPaid: {
        type: Boolean,
        default: true
    },
    maxDaysPerYear: {
        type: Number,
        required: [true, 'Max days per year is required'],
        min: 0
    },
    carryForwardLimit: {
        type: Number,
        default: 0,
        min: 0
    },
    requiresApproval: {
        type: Boolean,
        default: true
    },
    color: {
        type: String,
        default: '#3b82f6' // Default blue
    },
    affectsAttendance: {
        type: Boolean,
        default: true,
        description: 'If true, approved leave marks attendance as Leave'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
