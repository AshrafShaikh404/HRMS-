const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
require('dotenv').config();

const deleteUser = async (email) => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('MongoDB Connected');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`User with email ${email} not found.`);
            process.exit(0);
        }

        console.log(`Found user: ${user.name} (${user._id})`);

        // Delete associated employee record
        const employeeHelper = await Employee.deleteOne({ userId: user._id });
        console.log(`Deleted employee record: ${employeeHelper.deletedCount}`);

        // Delete user
        await User.deleteOne({ _id: user._id });
        console.log('Deleted user record.');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email address as an argument.');
    process.exit(1);
}

deleteUser(email);
