const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    jobPostingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobPosting',
        required: true
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    resume: {
        type: String,
        required: [true, 'Resume is required']
    },
    coverLetter: {
        type: String
    },
    skills: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['new', 'reviewed', 'rejected', 'selected'],
        default: 'new'
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes
candidateSchema.index({ jobPostingId: 1 });
candidateSchema.index({ status: 1 });
candidateSchema.index({ email: 1 });
candidateSchema.index({ appliedAt: -1 });

// Virtual for full name
candidateSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Candidate', candidateSchema);
