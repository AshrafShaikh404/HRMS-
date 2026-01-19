require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms');
        console.log('MongoDB Connected\n');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const createHRUser = async () => {
    try {
        await connectDB();

        // Get admin user for createdBy field
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('❌ No admin user found. Run seedAdmin.js first.');
            process.exit(1);
        }

        // Check if HR user already exists
        const existingHR = await User.findOne({ email: 'hr@hrms.com' });
        if (existingHR) {
            console.log('⚠️  HR user already exists');
            console.log('\n📋 HR LOGIN CREDENTIALS:');
            console.log('   Email: hr@hrms.com');
            console.log('   Password: hr123');
            process.exit(0);
        }

        // Create HR user
        const hrUser = await User.create({
            name: 'HR Manager',
            email: 'hr@hrms.com',
            passwordHash: 'hr12345',
            role: 'hr',
            status: 'active',
            createdBy: admin._id
        });

        console.log('✅ HR user created successfully!');
        console.log('\n📋 HR LOGIN CREDENTIALS:');
        console.log('   Email: hr@hrms.com');
        console.log('   Password: hr123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

createHRUser();
