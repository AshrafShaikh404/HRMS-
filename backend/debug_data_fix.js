const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('MongoDB Connection Error:', err.message);
        process.exit(1);
    }
};

const checkAndFixData = async () => {
    await connectDB();

    try {
        const employees = await Employee.find({});
        console.log(`Found ${employees.length} employees.`);

        let fixedCount = 0;

        for (const emp of employees) {
            let needsSave = false;

            if (!emp.leaveBalance || !emp.leaveBalance.casualLeave) {
                console.log(`Employee ${emp.firstName} ${emp.lastName} (${emp.employeeCode}) has missing leaveBalance.`);

                if (!emp.leaveBalance) {
                    emp.leaveBalance = {};
                }

                // Set defaults if missing
                if (emp.leaveBalance.casualLeave === undefined) emp.leaveBalance.casualLeave = 12;
                if (emp.leaveBalance.sickLeave === undefined) emp.leaveBalance.sickLeave = 6;
                if (emp.leaveBalance.earnedLeave === undefined) emp.leaveBalance.earnedLeave = 20;
                if (emp.leaveBalance.maternityLeave === undefined) emp.leaveBalance.maternityLeave = 0;
                if (emp.leaveBalance.unpaidLeave === undefined) emp.leaveBalance.unpaidLeave = 0;

                needsSave = true;
            }

            if (needsSave) {
                await emp.save();
                console.log(`Fixed data for ${emp.employeeCode}`);
                fixedCount++;
            }
        }

        console.log(`Summary: Fixed ${fixedCount} employees.`);

    } catch (error) {
        console.error('Error during check:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkAndFixData();
