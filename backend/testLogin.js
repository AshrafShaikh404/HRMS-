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

const testLogin = async () => {
    try {
        await connectDB();

        console.log('Testing admin user...');

        // Find admin user
        const user = await User.findOne({ email: 'admin@hrms.com' }).select('+passwordHash');

        if (!user) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }

        console.log('✅ Admin user found');
        console.log('User details:', {
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            passwordHashExists: !!user.passwordHash,
            passwordHashLength: user.passwordHash?.length
        });

        // Test password comparison
        const testPassword = 'admin123';
        console.log(`\nTesting password: "${testPassword}"`);

        const isMatch = await user.comparePassword(testPassword);
        console.log('Password match:', isMatch ? '✅ SUCCESS' : '❌ FAILED');

        process.exit(0);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
        process.exit(1);
    }
};

testLogin();
