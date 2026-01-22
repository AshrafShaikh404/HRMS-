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

const checkLinks = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        console.log(`\n--- Found ${users.length} Users ---`);

        for (const user of users) {
            const emp = await Employee.findOne({ userId: user._id });
            console.log(`User: ${user.name} (${user.email}) [Role: ${user.role}] -> Employee Linked: ${emp ? 'YES' : 'NO'}`);
            if (emp) {
                console.log(`   Emp Code: ${emp.employeeCode}, ID: ${emp._id}`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

checkLinks();
