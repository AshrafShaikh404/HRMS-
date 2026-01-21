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
