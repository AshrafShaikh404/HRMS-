const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        unique: true
    },
    // Base Components
    basicSalary: {
        type: Number,
        required: true,
        min: 0
    },
    hra: {
        type: Number,
        default: 0,
        min: 0
    },

    // Scalable Allowances
    allowances: [{
        name: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        isTaxable: {
            type: Boolean,
            default: true
        }
    }],

    // Scalable Deductions (Statutory & Others)
    deductions: [{
        name: {
            type: String, // e.g., "PF", "Professional Tax", "Medical Insurance"
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        isFixed: { // true = fixed amount, false = percentage (handling logic in controller)
            type: Boolean,
            default: true
        }
    }],

    // Meta
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
