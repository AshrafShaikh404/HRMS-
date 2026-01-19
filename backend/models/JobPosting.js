const mongoose = require('mongoose');

const jobPostingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Admin', 'Other']
    },
    salaryRange: {
        min: {
            type: Number,
            required: true,
            min: 0
        },
        max: {
            type: Number,
            required: true,
            min: 0
        }
    },
    skillsRequired: [{
        type: String,
        trim: true
    }],
    numberOfOpenings: {
        type: Number,
        default: 1,
        min: 1
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'on_hold'],
        default: 'open'
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    closureDate: {
        type: Date
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
jobPostingSchema.index({ status: 1 });
jobPostingSchema.index({ department: 1 });
jobPostingSchema.index({ postedDate: -1 });

// Validate salary range
jobPostingSchema.pre('save', function (next) {
    if (this.salaryRange.max < this.salaryRange.min) {
        next(new Error('Maximum salary cannot be less than minimum salary'));
    } else {
        next();
    }
});

module.exports = mongoose.model('JobPosting', jobPostingSchema);
