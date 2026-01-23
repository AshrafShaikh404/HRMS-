const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Employee ID is required']
    },
    reviewCycleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ReviewCycle',
        required: [true, 'Review Cycle ID is required']
    },
    goals: [{
        goalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Goal',
            required: true
        },
        finalProgress: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        selfComment: {
            type: String,
            maxLength: 500
        },
        managerComment: {
            type: String,
            maxLength: 500
        }
    }],
    selfRating: {
        type: Number,
        min: 1,
        max: 5,
        validate: {
            validator: function (v) {
                return v >= 1 && v <= 5;
            },
            message: 'Self rating must be between 1 and 5'
        }
    },
    managerRating: {
        type: Number,
        min: 1,
        max: 5,
        validate: {
            validator: function (v) {
                return v >= 1 && v <= 5;
            },
            message: 'Manager rating must be between 1 and 5'
        }
    },
    hrRating: {
        type: Number,
        min: 1,
        max: 5,
        validate: {
            validator: function (v) {
                return v >= 1 && v <= 5;
            },
            message: 'HR rating must be between 1 and 5'
        }
    },
    finalRating: {
        type: Number,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: ['Not Started', 'Self Submitted', 'Manager Reviewed', 'HR Reviewed', 'Finalized'],
        default: 'Not Started'
    },
    submittedAt: {
        type: Date
    },
    reviewedByManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedByHR: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to ensure one review per employee per cycle
performanceReviewSchema.index({ employeeId: 1, reviewCycleId: 1 }, { unique: true });

// Index for fetching reviews by status and cycle
performanceReviewSchema.index({ reviewCycleId: 1, status: 1 });
performanceReviewSchema.index({ employeeId: 1 });

// Pre-save middleware to auto-calculate final rating
// Pre-save middleware to auto-calculate final rating
// performanceReviewSchema.pre('save', function(next) {
// Logic moved to controller to support weighted formula
//    next();
// });

// Pre-save middleware to validate review cycle status
performanceReviewSchema.pre('save', async function (next) {
    if (this.isNew || this.isModified('status')) {
        try {
            const ReviewCycle = mongoose.model('ReviewCycle');
            const reviewCycle = await ReviewCycle.findById(this.reviewCycleId);

            if (!reviewCycle) {
                return next(new Error('Review Cycle not found'));
            }

            // If cycle is closed, prevent any modifications
            if (reviewCycle.status === 'Closed' && this.status !== 'Finalized') {
                return next(new Error('Cannot modify review for a closed review cycle'));
            }

            // Auto-set timestamps based on status transitions
            if (this.isModified('status')) {
                const oldStatus = this._originalStatus || 'Not Started';

                if (oldStatus !== 'Self Submitted' && this.status === 'Self Submitted') {
                    this.submittedAt = new Date();
                }
            }

            this._originalStatus = this.status;
        } catch (error) {
            return next(error);
        }
    }

    next();
});

// Static method to find review by employee and cycle
performanceReviewSchema.statics.findByEmployeeAndCycle = function (employeeId, reviewCycleId) {
    return this.findOne({ employeeId, reviewCycleId }).populate('goals.goalId');
};

// Static method to get reviews by cycle and status
performanceReviewSchema.statics.findByCycleAndStatus = function (reviewCycleId, status) {
    const query = { reviewCycleId };
    if (status) query.status = status;

    return this.find(query)
        .populate('employeeId', 'firstName lastName employeeCode')
        .populate('goals.goalId', 'title description weightage')
        .populate('reviewedByManager', 'firstName lastName')
        .populate('reviewedByHR', 'firstName lastName');
};

// Instance method to check if review is editable
performanceReviewSchema.methods.isEditable = async function () {
    try {
        const ReviewCycle = mongoose.model('ReviewCycle');
        const reviewCycle = await ReviewCycle.findById(this.reviewCycleId);

        return reviewCycle && reviewCycle.status === 'Active';
    } catch (error) {
        return false;
    }
};

// Instance method to get next required action
performanceReviewSchema.methods.getNextAction = function () {
    switch (this.status) {
        case 'Not Started':
            return 'Self Review';
        case 'Self Submitted':
            return 'Manager Review';
        case 'Manager Reviewed':
            return 'HR Review';
        case 'HR Reviewed':
            return 'Finalize';
        case 'Finalized':
            return 'Completed';
        default:
            return 'Unknown';
    }
};

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
