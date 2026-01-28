const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
        unique: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
    },
    timezone: {
        type: String,
        required: [true, 'Timezone is required'], // e.g., 'Asia/Kolkata', 'UTC'
        trim: true
    },
    workType: {
        type: String,
        enum: ['Onsite', 'Remote', 'Hybrid'],
        default: 'Onsite'
    },
    workingDays: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], // Default Mon-Fri
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    workingHours: {
        start: { type: String, default: '09:00' }, // 24hr format
        end: { type: String, default: '18:00' }
    },
    holidayCalendar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Calendar' // Future proofing
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Location', locationSchema);
