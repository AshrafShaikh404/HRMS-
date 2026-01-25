const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const listUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // List all users with their emails and roles
        const users = await User.find({}).sort({ createdAt: -1 }).limit(20);
        console.log('--- RECENT USERS ---');
        users.forEach(u => {
            console.log(`Email: ${u.email} | Role: ${u.role} | ID: ${u._id}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listUsers();
