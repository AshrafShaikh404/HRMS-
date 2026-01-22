const mongoose = require('mongoose');
const LeaveType = require('./models/LeaveType');
const Employee = require('./models/Employee');
const LeaveBalance = require('./models/LeaveBalance');
const User = require('./models/User'); // Required for population if referenced

require('dotenv').config();

const initBalances = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hrms');
        console.log('Connected to MongoDB');

        const year = new Date().getFullYear();
        const leaveTypes = await LeaveType.find({ isActive: true });

        if (!leaveTypes.length) {
            console.log('No active leave types found.');
            process.exit(1);
        }

        const employees = await Employee.find({ status: 'active' });
        console.log(`Found ${employees.length} active employees.`);

        let createdCount = 0;

        for (const emp of employees) {
            for (const type of leaveTypes) {
                const exists = await LeaveBalance.findOne({
                    employeeId: emp._id,
                    leaveType: type._id,
                    year
                });

                if (!exists) {
                    await LeaveBalance.create({
                        employeeId: emp._id,
                        leaveType: type._id,
                        year,
                        totalAccrued: type.maxDaysPerYear,
                        used: 0,
                        pending: 0,
                        history: [{
                            action: 'INITIAL_ALLOCATION',
                            days: type.maxDaysPerYear,
                            reason: 'System Initialization',
                            date: new Date()
                        }]
                    });
                    createdCount++;
                    console.log(`Created balance for ${emp.employeeCode} - ${type.name}`);
                }
            }
        }

        console.log(`Initialization complete. Created ${createdCount} new balance records.`);
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

initBalances();
