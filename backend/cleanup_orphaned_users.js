const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Role = require('./models/Role');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const cleanupOrphans = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Get Employee Role ID
        const empRole = await Role.findOne({ name: { $regex: /^employee$/i } });
        if (!empRole) {
            console.log('Employee role not found');
            process.exit(1);
        }

        // Find all users with role 'employee'
        const users = await User.find({ role: empRole._id });
        console.log(`Found ${users.length} total users with Employee role.`);

        let deletedCount = 0;

        for (const user of users) {
            // Check if an Employee record exists for this userId
            const employee = await Employee.findOne({ userId: user._id });

            if (!employee) {
                console.log(`ORPHAN FOUND: User ${user.email} (ID: ${user._id}) has no Employee record. Deleting...`);
                await User.findByIdAndDelete(user._id);
                deletedCount++;
            }
        }

        console.log(`Cleanup Complete. Deleted ${deletedCount} orphaned users.`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanupOrphans();
