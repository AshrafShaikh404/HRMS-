const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Role = require('./models/Role');
const Permission = require('./models/Permission');

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find().populate('role');
        console.log(`Found ${users.length} users`);

        users.forEach(u => {
            console.log(`User: ${u.email}, Role Type: ${typeof u.role}, Role Data: ${JSON.stringify(u.role)}`);
        });

        const roles = await Role.find();
        console.log(`Available Roles: ${roles.map(r => r.name).join(', ')}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verify();
