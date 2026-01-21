const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Designation name is required'],
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    level: {
        type: Number,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
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

// Compound index to ensure unique designation names within a department
designationSchema.index({ name: 1, department: 1 }, { unique: true });

module.exports = mongoose.model('Designation', designationSchema);
