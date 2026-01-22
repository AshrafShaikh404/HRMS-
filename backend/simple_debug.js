const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Employee = require('./models/Employee');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('Connected\n');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const check = async (email) => {
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
        console.log(`User ${email} not found`);
        mongoose.connection.close();
        return;
    }

    console.log(`User: ${user.name} (${user.email})`);
    console.log(`Role ID: ${user.role}`);

    const emp = await Employee.findOne({ userId: user._id });
    console.log(`Employee: ${emp ? emp.employeeCode : 'NOT LINKED'}`);

    mongoose.connection.close();
};

check(process.argv[2] || 'asrafsk756@gmail.com');
