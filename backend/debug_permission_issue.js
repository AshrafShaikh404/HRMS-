const mongoose = require('mongoose');
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find the test employee
        const email = 'employee@example.com';
        // Note: The screenshot shows "Ashraf Shaikh", we should check if that matches employee@example.com or if we need to search by name.
        // Let's search by email first, and also list all users to see who "Ashraf Shaikh" is.

        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            console.log(`User ${email} not found.`);
        } else {
            console.log(`\nUser: ${user.name} (${user.email})`);
            console.log(`Role: ${user.role?.name} (ID: ${user.role?._id})`);

            if (user.role) {
                const role = await Role.findById(user.role._id).populate('permissions');
                console.log(`\nPermissions for Role ${role.name}:`);
                if (role.permissions && role.permissions.length > 0) {
                    role.permissions.forEach(p => {
                        console.log(` - ${p.name} (ID: ${p._id})`);
                    });
                } else {
                    console.log(' - No permissions found in DB for this role.');
                }
            }
        }

        // Check specifically for "Ashraf Shaikh" if different
        const users = await User.find({ name: /Ashraf/i });
        if (users.length > 0) {
            console.log('\n--- Found Users matching "Ashraf" ---');
            for (const u of users) {
                console.log(`User: ${u.name} (${u.email}) Role: ${u.role}`);
                // We heavily rely on the updated Role schema, so lets check if role is ObjectId
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

debug();
