const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkLink = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        const email = 'varma123@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User ${email} not found.`);
        } else {
            console.log(`User found: ${user._id}`);
            const emp = await Employee.findOne({ userId: user._id });
            if (emp) {
                console.log(`Employee record found for user: ${emp._id}`);
            } else {
                console.log('WARNING: No Employee record found for this user! (Orphan)');
                console.log('Deleting orphaned user...');
                await User.findByIdAndDelete(user._id);
                console.log('Orphaned user deleted.');
            }
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkLink();
