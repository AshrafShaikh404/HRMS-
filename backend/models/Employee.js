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

    // Employment Details (New Structure)
    employmentDetails: {
        employmentType: {
            type: String,
            enum: ['Full-time', 'Part-time', 'Contract', 'Intern', 'Consultant'],
            default: 'Full-time'
        },
        employmentStatus: {
            type: String,
            enum: ['Active', 'On Probation', 'Notice Period', 'Resigned', 'Terminated'],
            default: 'Active'
        },
        joiningDate: {
            type: Date,
            default: Date.now
        },
        probationPeriod: {
            type: Number, // in days
            default: 0
        },
        confirmationDate: {
            type: Date
        },
        exitDate: {
            type: Date
        }
    },

    // Job Information (New Structure)
    jobInfo: {
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        },
        designation: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Designation'
        },
        location: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Location'
        },
        reportingManager: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        workSchedule: {
            type: String // Placeholder for Phase 3.1
        },
        assignedLeavePolicy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'LeavePolicy'
        }
    },

    // Legacy Fields (Kept for backward compatibility - will be populated via hooks/controller)
    department: { type: String },
    designation: { type: String },
    employmentType: { type: String },
    joinDate: { type: Date },

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
employeeSchema.pre('save', async function (next) {
    // 1. Generate Employee Code
    if (this.isNew && !this.employeeCode) {
        const year = new Date().getFullYear();
        this.employeeCode = `EMP-${year}-${Date.now()}`;
    }

    // 2. Sync Legacy Fields (Fallback Mapping)
    if (this.jobInfo) {
        if (this.jobInfo.department) {
            // If populated, take name, else if it's an ID, we might not have the name handy easily without a populate. 
            // Ideally controller should set this, but let's try to handle it.
            // For now, if modification happened to jobInfo, we should try to sync.
            // But fetching DB inside pre-save for every save is expensive.
            // Strategy: The controller is expected to pass the Names if needed, 
            // but let's at least map the simple ones if we can, or relies on controller.
            // Actually, the user requirement says "Keep them temporarily as virtuals or fallback mapping".
            // If we rely on controller, we don't need logic here. 
            // Let's implement a basic sync if the nested values are present and are strings (names) or if we can derive them.
            // Since they are Refs (ObjectIds), we can't easily get the Name synchronously here without a query.
            // So we will rely on the CONTROLLER to populate the legacy string fields for now, 
            // OR we change legacy fields to be populated via populate().
        }
    }

    // However, let's at least sync the dates/types which are simple values
    if (this.employmentDetails) {
        if (this.employmentDetails.employmentType) {
            this.employmentType = this.employmentDetails.employmentType;
        }
        if (this.employmentDetails.joiningDate) {
            this.joinDate = this.employmentDetails.joiningDate;
        }
    }

    next();
});

module.exports = mongoose.model('Employee', employeeSchema);
