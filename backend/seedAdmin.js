require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        await connectDB();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@hrms.com' });

        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create admin user
        const admin = await User.create({
            name: 'System Administrator',
            email: 'admin@hrms.com',
            passwordHash: 'admin123', // Will be hashed by the model pre-save hook
            role: 'admin',
            status: 'active'
        });

        console.log('✅ Admin user created successfully!');
        console.log('-----------------------------------');
        console.log('Email: admin@hrms.com');
        console.log('Password: admin123');
        console.log('-----------------------------------');
        console.log('⚠️  Please change the password after first login!');

        process.exit(0);
    } catch (error) {
        console.error(`Error seeding admin: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
