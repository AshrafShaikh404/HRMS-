const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        sparse: true
    },
    employeeCode: {
        type: String,
        unique: true
    },

    // Personal Information
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
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['M', 'F', 'Other']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    address: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    pinCode: {
        type: String
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },

    // Job Information
    department: {
        type: String,
        required: [true, 'Department is required'],
        enum: ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Admin', 'Other']
    },
    designation: {
        type: String,
        required: [true, 'Designation is required']
    },
    employmentType: {
        type: String,
        required: [true, 'Employment type is required'],
        enum: ['Full-time', 'Part-time', 'Intern', 'Contract', 'Consultant']
    },
    joinDate: {
        type: Date,
        required: [true, 'Join date is required'],
        default: Date.now
    },
    salary: {
        type: Number,
        required: [true, 'Salary is required'],
        min: 0
    },
    bankAccount: {
        type: String
    },
    panCard: {
        type: String
    },
    aadharCard: {
        type: String
    },

    // Statutory Info: Validation logic handled in Controller
    uan: { type: String },
    pfNumber: { type: String },
    esiNumber: { type: String },
    taxDeduction: { type: Number, default: 0 },
    isPfEligible: { type: Boolean, default: true },
    isEsiEligible: { type: Boolean, default: true },

    // Status
    status: {
        type: String,
        enum: ['active', 'inactive', 'on_leave', 'terminated'],
        default: 'active'
    },

    profileCompletion: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Leave Balance
    leaveBalance: {
        casualLeave: { type: Number, default: 12 },
        sickLeave: { type: Number, default: 6 },
        earnedLeave: { type: Number, default: 20 },
        maternityLeave: { type: Number, default: 0 },
        unpaidLeave: { type: Number, default: 0 }
    },

    // Documents with Audit
    documents: [{
        name: String, // e.g., "Aadhaar Card"
        type: String, // mimetype
        filePath: String,
        uploadDate: { type: Date, default: Date.now },
        status: {
            type: String,
            enum: ['Pending', 'Verified', 'Rejected'],
            default: 'Pending'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: {
            type: Date
        },
        rejectionReason: {
            type: String
        }
    }],

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for faster queries
employeeSchema.index({ employeeCode: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Auto-generate employee code before saving
employeeSchema.pre('save', function (next) {
    if (!this.isNew || this.employeeCode) return next();

    const year = new Date().getFullYear();
    this.employeeCode = `EMP-${year}-${Date.now()}`;
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
