const mongoose = require('mongoose');
require('dotenv').config();
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');

async function debugDashboard() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // 1. Employee Stats
        const totalEmployees = await Employee.countDocuments();
        console.log('Total Employees:', totalEmployees);

        // 2. Attendance Stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        console.log('Querying Attendance for:', today, 'to', tomorrow);

        const todayAttendance = await Attendance.find({
            date: { $gte: today, $lt: tomorrow }
        });
        console.log('Today Attendance Found:', todayAttendance.length);

        // 3. Department Breakdown (Aggregation)
        console.log('Running Aggregation...');
        const departmentBreakdown = await Employee.aggregate([
            { $match: { status: 'active' } },
            {
                $group: {
                    _id: '$department',
                    count: { $sum: 1 }
                }
            }
        ]);
        console.log('Department Breakdown:', departmentBreakdown);

        process.exit(0);
    } catch (err) {
        console.error('DEBUG ERROR:', err);
        process.exit(1);
    }
}

debugDashboard();
