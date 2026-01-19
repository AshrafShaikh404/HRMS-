const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const connectDB = require('./config/database');
require('dotenv').config();

const fixMissingEmployees = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const users = await User.find({ role: 'employee' });
        console.log(`Found ${users.length} users with role 'employee'`);

        for (const user of users) {
            const employee = await Employee.findOne({ userId: user._id });

            if (!employee) {
                console.log(`User ${user.email} (${user._id}) has NO employee record. Creating one...`);

                // Generat unique code
                const count = await Employee.countDocuments();
                // Add random suffix to avoid collision in tight loop
                const suffix = Math.floor(Math.random() * 1000);
                const employeeCode = `EMP${String(count + 1 + suffix).padStart(3, '0')}`;

                const nameParts = (user.name || 'Google User').split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '.';

                try {
                    await Employee.create({
                        userId: user._id,
                        employeeCode: employeeCode,
                        firstName: firstName,
                        lastName: lastName,
                        email: user.email,
                        department: 'General',
                        designation: 'New Joinee',
                        employmentType: 'Full-time',
                        phone: '0000000000',
                        joinDate: new Date(),
                        status: 'active',
                        salary: 0,
                        leaveBalance: {
                            casualLeave: 12,
                            sickLeave: 12,
                            earnedLeave: 0
                        }
                    });
                    console.log(`Successfully created employee record for ${user.email}`);
                } catch (err) {
                    console.error(`Failed to create employee for ${user.email}:`, err.message);
                }
            } else {
                console.log(`User ${user.email} already has employee record.`);
            }
        }

        console.log('Finished fixing employees.');
        process.exit(0);

    } catch (error) {
        console.error('Script error:', error);
        process.exit(1);
    }
};

fixMissingEmployees();
