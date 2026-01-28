const mongoose = require('mongoose');

const appraisalRecordSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee ID is required']
    },
    appraisalCycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AppraisalCycle',
        required: [true, 'Appraisal Cycle ID is required']
    },
    finalRating: {
        type: Number,
        min: 1,
        max: 5
    },
    incrementType: {
        type: String,
        enum: ['Percentage', 'Fixed'],
        required: [true, 'Increment type is required']
    },
    incrementValue: {
        type: Number,
        required: [true, 'Increment value is required'],
        min: 0
    },
    oldCTC: {
        type: Number,
        required: [true, 'Old CTC is required'],
        min: 0
    },
    newCTC: {
        type: Number,
        required: [true, 'New CTC is required'],
        min: 0
    },
    previousDesignation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation'
    },
    newDesignation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation'
    },
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective date is required']
    },
    status: {
        type: String,
        enum: ['Proposed', 'Approved', 'Rejected'],
        default: 'Proposed'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    remarks: {
        type: String,
        trim: true,
        maxLength: 500
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate appraisals per cycle per employee
appraisalRecordSchema.index({ employeeId: 1, appraisalCycleId: 1 }, { unique: true });

module.exports = mongoose.model('AppraisalRecord', appraisalRecordSchema);
