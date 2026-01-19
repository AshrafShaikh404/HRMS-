const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkInTime: {
        type: Date
    },
    checkOutTime: {
        type: Date
    },
    workedHours: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['present', 'half_day', 'absent', 'holiday', 'leave'],
        default: 'absent'
    },
    remarks: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Compound index for faster queries (one attendance record per employee per day)
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });
attendanceSchema.index({ status: 1 });

// Calculate worked hours before saving if checkIn and checkOut are present
attendanceSchema.pre('save', function (next) {
    if (this.checkInTime && this.checkOutTime) {
        const diffMs = this.checkOutTime - this.checkInTime;
        this.workedHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        // Auto-set status based on worked hours
        if (this.workedHours >= 8) {
            this.status = 'present';
        } else if (this.workedHours >= 4) {
            this.status = 'half_day';
        } else {
            this.status = 'absent';
        }
    }
    next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
