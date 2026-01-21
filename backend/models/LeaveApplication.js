const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaveType',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        required: true,
        min: 0.5
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: String,
    halfDay: {
        type: Boolean,
        default: false
    },
    halfDaySession: {
        type: String,
        enum: ['First Half', 'Second Half', null],
        default: null
    },
    documents: [{
        url: String,
        name: String
    }]
}, {
    timestamps: true
});

// Index for quick querying of an employee's leaves
leaveApplicationSchema.index({ employeeId: 1, startDate: -1 });
leaveApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);
