const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Goal title is required']
    },
    description: {
        type: String,
        maxLength: 500
    },
    type: {
        type: String,
        enum: ['Individual', 'Team', 'Department'],
        default: 'Individual'
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: function () {
            // Require departmentId if type is Department or Team (optionally for Team)
            return this.type === 'Department';
        }
    },
    weightage: {
        type: Number,
        min: 0,
        max: 100,
        required: [true, 'Weightage is required']
    },
    targetValue: {
        type: Number, // Optional numeric target (e.g., "Achieve 5M revenue" -> 5)
        default: null
    },
    currentValue: {
        type: Number, // To track numeric progress
        default: 0
    },
    progress: {
        type: Number, // Percentage 0-100
        min: 0,
        max: 100,
        default: 0
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
        enum: ['Draft', 'Active', 'Completed', 'Archived'],
        default: 'Draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [{
        text: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Index for fetching goals by assignee
goalSchema.index({ assignedTo: 1, status: 1 });
goalSchema.index({ type: 1 });

module.exports = mongoose.model('Goal', goalSchema);
