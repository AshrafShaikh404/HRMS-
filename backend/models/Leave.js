const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['casual', 'sick', 'earned', 'maternity', 'unpaid'],
        required: [true, 'Leave type is required']
    },
    fromDate: {
        type: Date,
        required: [true, 'From date is required']
    },
    toDate: {
        type: Date,
        required: [true, 'To date is required']
    },
    numberOfDays: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        required: [true, 'Reason is required']
    },
    attachment: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    appliedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
leaveSchema.index({ employeeId: 1 });
leaveSchema.index({ status: 1 });
leaveSchema.index({ fromDate: 1, toDate: 1 });
leaveSchema.index({ approvalDate: 1 });

// Calculate number of days before saving
leaveSchema.pre('save', function (next) {
    if (this.isModified('fromDate') || this.isModified('toDate')) {
        const diffTime = Math.abs(this.toDate - this.fromDate);
        this.numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});

// Validate that toDate is not before fromDate
leaveSchema.pre('save', function (next) {
    if (this.toDate < this.fromDate) {
        next(new Error('To date cannot be before from date'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Leave', leaveSchema);
