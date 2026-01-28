const mongoose = require('mongoose');

const appraisalCycleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Appraisal cycle name is required'],
        unique: true,
        trim: true
    },
    linkedReviewCycle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewCycle',
        required: [true, 'Linked Review Cycle is required'],
        unique: true // One appraisal cycle per review cycle
    },
    status: {
        type: String,
        enum: ['Draft', 'Active', 'Closed'],
        default: 'Draft'
    },
    effectiveFrom: {
        type: Date,
        required: [true, 'Effective date is required']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AppraisalCycle', appraisalCycleSchema);
