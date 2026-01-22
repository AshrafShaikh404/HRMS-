const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('./models/Role');
const PERMISSIONS = require('./config/permissions');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('Connected\n');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkRole = async () => {
    await connectDB();

    const role = await Role.findOne({ _id: '696f22ee63261223bed398ed' });
    if (!role) {
        console.log('Role not found');
        mongoose.connection.close();
        return;
    }

    console.log(`Role Name: "${role.name}"`);
    console.log(`Role Name Lowercase: "${role.name.toLowerCase()}"`);
    console.log(`Permissions in config for "${role.name.toLowerCase()}": ${PERMISSIONS[role.name.toLowerCase()] ? 'FOUND' : 'NOT FOUND'}`);

    if (PERMISSIONS[role.name.toLowerCase()]) {
        console.log('\nPermissions from config:');
        PERMISSIONS[role.name.toLowerCase()].forEach(p => console.log(`  - ${p}`));
    }

    mongoose.connection.close();
};

checkRole();
