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

const checkAll = async () => {
    await connectDB();

    console.log('=== ALL USER-EMPLOYEE MAPPINGS ===\n');

    const users = await User.find({});

    for (const user of users) {
        const emp = await Employee.findOne({ userId: user._id });
        const empByEmail = await Employee.findOne({ email: user.email });

        console.log(`User: ${user.email}`);
        console.log(`  _id: ${user._id}`);
        console.log(`  Role: ${user.role?.name || 'NO ROLE'}`);
        console.log(`  Linked by userId: ${emp ? emp.employeeCode : 'NOT FOUND'}`);
        console.log(`  Linked by email: ${empByEmail ? empByEmail.employeeCode : 'NOT FOUND'}`);

        if (emp && empByEmail && emp._id.toString() !== empByEmail._id.toString()) {
            console.log(`  ⚠️ MISMATCH: Different employees for userId vs email!`);
        }
        console.log('');
    }

    mongoose.connection.close();
};

checkAll();
