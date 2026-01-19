const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    category: {
        type: String,
        enum: ['IT', 'HR', 'Admin', 'Facilities'],
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
        default: 'Open'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [String],
    updates: [{
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        comment: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    resolvedAt: Date,
    closedAt: Date
}, {
    timestamps: true
});

// Auto-generate ticket number before saving
ticketSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
