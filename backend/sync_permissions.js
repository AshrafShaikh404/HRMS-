const mongoose = require('mongoose');
require('dotenv').config();
const Role = require('./models/Role');
const Permission = require('./models/Permission'); // Assuming this model exists
const PERMISSIONS = require('./config/permissions');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

const syncPermissions = async () => {
    await connectDB();

    try {
        console.log('Syncing permissions...');

        for (const [roleName, permissionNames] of Object.entries(PERMISSIONS)) {
            console.log(`Processing role: ${roleName}`);

            // 1. Resolve Permission Names to IDs
            const permissionIds = [];
            for (const permName of permissionNames) {
                let perm = await Permission.findOne({ name: permName });
                if (!perm) {
                    console.log(`  -> Creating permission: ${permName}`);
                    perm = await Permission.create({
                        name: permName,
                        description: `Permission to ${permName.replace(/_/g, ' ')}`,
                        module: 'General' // Default module
                    });
                }
                permissionIds.push(perm.name);
            }

            // 2. Update Role
            const role = await Role.findOne({ name: { $regex: new RegExp(`^${roleName}$`, 'i') } });

            if (role) {
                // Update permissions
                role.permissions = permissionIds;
                await role.save();
                console.log(`  -> Updated permissions for existing role: ${role.name}`);
            } else {
                // Create Role
                await Role.create({
                    name: roleName.charAt(0).toUpperCase() + roleName.slice(1),
                    permissions: permissionIds,
                    description: `Default ${roleName} role`
                });
                console.log(`  -> Created new role: ${roleName}`);
            }
        }

        console.log('Permission sync complete!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

syncPermissions();
