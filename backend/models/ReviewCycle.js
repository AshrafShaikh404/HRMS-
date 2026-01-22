const mongoose = require('mongoose');

const reviewCycleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Cycle name is required'],
        unique: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Active', 'Closed'],
        default: 'Upcoming'
    },
    selfReviewOpen: {
        type: Boolean,
        default: false
    },
    managerReviewOpen: {
        type: Boolean,
        default: false
    },
    hrReviewOpen: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Rules: Only 1 active cycle at a time
// We can enforce this in controller or via unique partial index (if status is Active)
// Partial index might be safer:
// reviewCycleSchema.index({ status: 1 }, { unique: true, partialFilterExpression: { status: 'Active' } });

module.exports = mongoose.model('ReviewCycle', reviewCycleSchema);
