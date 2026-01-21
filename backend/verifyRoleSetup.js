const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission'); // Ensure it's registered
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: 'admin@example.com' }).populate({
            path: 'role',
            populate: { path: 'permissions' }
        });

        if (!user) {
            console.log('Admin user not found, checking any user...');
            const anyUser = await User.findOne().populate({
                path: 'role',
                populate: { path: 'permissions' }
            });
            if (anyUser) {
                console.log('User found:', anyUser.email);
                console.log('Role:', anyUser.role?.name);
                console.log('Permissions Count:', anyUser.role?.permissions?.length);
            } else {
                console.log('No users found in database');
            }
        } else {
            console.log('Admin User Verified');
            console.log('Role:', user.role.name);
            console.log('Permissions Count:', user.role.permissions.length);
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verify();
