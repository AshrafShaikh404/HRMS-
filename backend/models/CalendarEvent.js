const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    eventType: {
        type: String,
        enum: ['HOLIDAY', 'LEAVE', 'ATTENDANCE_ANOMALY', 'INTERVIEW', 'MEETING', 'TRAINING', 'PAYROLL', 'BIRTHDAY', 'ANNIVERSARY', 'SYSTEM_REMINDER', 'CUSTOM_EVENT'],
        default: 'CUSTOM_EVENT',
        required: true
    },
    start: {
        type: Date,
        required: true
    },
    end: {
        type: Date,
        required: true
    },
    allDay: {
        type: Boolean,
        default: false
    },
    recurrence: {
        type: String, // Store RRULE string e.g., "FREQ=WEEKLY;INTERVAL=1"
        default: null
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    visibility: {
        type: String,
        enum: ['PERSONAL', 'TEAM', 'COMPANY'],
        default: 'PERSONAL',
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    source: {
        type: String,
        enum: ['HRMS', 'GOOGLE', 'OUTLOOK'],
        default: 'HRMS'
    },
    externalEventId: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
        default: 'CONFIRMED'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department' // Optional: if visibility is TEAM, link to department
    }
}, {
    timestamps: true
});

// Indexes for faster querying
calendarEventSchema.index({ start: 1, end: 1 });
calendarEventSchema.index({ creator: 1 });
calendarEventSchema.index({ participants: 1 });
calendarEventSchema.index({ eventType: 1 });

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
