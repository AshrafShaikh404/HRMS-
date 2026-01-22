const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Employee = require('./models/Employee');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const linkMissingEmployees = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`Checking ${users.length} users for employee links...`);

        for (const user of users) {
            const existingEmp = await Employee.findOne({ userId: user._id });

            if (existingEmp) {
                console.log(`[OK] ${user.email} is linked to ${existingEmp.employeeCode}`);
                continue;
            }

            console.log(`[MISSING] Creating employee profile for ${user.email}...`);

            // Split name
            const parts = (user.name || 'Unknown User').split(' ');
            const firstName = parts[0];
            const lastName = parts.length > 1 ? parts.slice(1).join(' ') : 'User';

            const newEmp = await Employee.create({
                userId: user._id,
                firstName,
                lastName,
                email: user.email,
                phone: '9876543210', // Dummy phone
                salary: 50000, // Dummy salary
                department: 'Engineering',
                designation: 'Software Engineer',
                employmentDetails: {
                    employmentType: 'Full-time',
                    joiningDate: new Date(),
                    employmentStatus: 'Active'
                },
                isPfEligible: true,
                isEsiEligible: true,
                status: 'active'
                // employeeCode will be auto-generated
            });

            console.log(`   -> Created: ${newEmp.employeeCode}`);
        }

        console.log('\nDone! All users should now have employee profiles.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

linkMissingEmployees();
