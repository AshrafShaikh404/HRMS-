const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Permission = require('./models/Permission');
const Role = require('./models/Role');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const permissionsList = [
    { name: 'view_dashboard', module: 'Dashboard', description: 'View Dashboard' },

    { name: 'view_employees', module: 'Employees', description: 'View Employees' },
    { name: 'create_employees', module: 'Employees', description: 'Create Employees' },
    { name: 'update_employees', module: 'Employees', description: 'Update Employees' },
    { name: 'delete_employees', module: 'Employees', description: 'Delete Employees' },

    { name: 'view_attendance', module: 'Attendance', description: 'View Attendance' },
    { name: 'update_attendance', module: 'Attendance', description: 'Update Attendance' },
    { name: 'manage_attendance', module: 'Attendance', description: 'Manage Attendance' },
    { name: 'export_attendance', module: 'Attendance', description: 'Export Attendance' },

    { name: 'view_leaves', module: 'Leaves', description: 'View Leaves' },
    { name: 'approve_leaves', module: 'Leaves', description: 'Approve/Reject Leaves' },
    { name: 'apply_leaves', module: 'Leaves', description: 'Apply for Leaves' },
    { name: 'manage_leave_types', module: 'Leaves', description: 'Manage Leave Types' },
    { name: 'manage_leave_policies', module: 'Leaves', description: 'Manage Leave Policies' },
    { name: 'view_leave_balance', module: 'Leaves', description: 'View Leave Balance' },

    { name: 'view_payroll', module: 'Payroll', description: 'View Payroll' },
    { name: 'process_payroll', module: 'Payroll', description: 'Process Payroll' },

    { name: 'view_calendar', module: 'Calendar', description: 'View Calendar' },

    { name: 'view_helpdesk', module: 'Helpdesk', description: 'View Helpdesk' },
    { name: 'manage_helpdesk', module: 'Helpdesk', description: 'Manage Tickets' },

    { name: 'view_reports', module: 'Reports', description: 'View Reports' },

    { name: 'view_settings', module: 'Settings', description: 'View Settings' },
    { name: 'manage_access_control', module: 'Settings', description: 'Manage Roles & Permissions' },

    { name: 'manage_departments', module: 'Organization', description: 'Manage Departments' },
    { name: 'manage_designations', module: 'Organization', description: 'Manage Designations' },
    { name: 'manage_locations', module: 'Organization', description: 'Manage Locations' },
    { name: 'manage_employment_details', module: 'Employees', description: 'Manage Employment Details' },
    { name: 'manage_job_information', module: 'Employees', description: 'Manage Job Information' },
];

const roleDefinitions = {
    admin: {
        name: 'Admin',
        description: 'System Administrator with full access',
        isSystem: true,
        permissions: [] // All permissions
    },
    hr: {
        name: 'HR',
        description: 'Human Resources Manager',
        isSystem: true,
        permissions: ['view_dashboard', 'view_employees', 'create_employees', 'update_employees', 'view_attendance', 'update_attendance', 'view_leaves', 'approve_leaves', 'apply_leaves', 'manage_leave_types', 'manage_leave_policies', 'view_leave_balance', 'view_payroll', 'process_payroll', 'view_calendar', 'view_helpdesk', 'manage_helpdesk', 'view_reports']
    },
    employee: {
        name: 'Employee',
        description: 'Standard Employee',
        isSystem: true,
        permissions: ['view_dashboard', 'view_calendar', 'apply_leaves', 'view_leaves', 'view_leave_balance', 'view_attendance', 'view_helpdesk']
    }
};

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Create Permissions
        console.log('Seeding Permissions...');
        const permissionMap = {};
        for (const perm of permissionsList) {
            const p = await Permission.findOneAndUpdate(
                { name: perm.name },
                perm,
                { upsert: true, new: true }
            );
            permissionMap[perm.name] = p._id;
        }
        console.log(`Seeded ${Object.keys(permissionMap).length} permissions`);

        // 2. Create Roles
        console.log('Seeding Roles...');

        // Admin gets all permissions
        const allPermissionIds = Object.values(permissionMap);

        await Role.findOneAndUpdate(
            { name: 'Admin' },
            {
                ...roleDefinitions.admin,
                permissions: allPermissionIds
            },
            { upsert: true, new: true }
        );

        // HR
        const hrPermIds = roleDefinitions.hr.permissions.map(p => permissionMap[p]);
        await Role.findOneAndUpdate(
            { name: 'HR' },
            {
                ...roleDefinitions.hr,
                permissions: hrPermIds
            },
            { upsert: true, new: true }
        );

        // Employee
        const empPermIds = roleDefinitions.employee.permissions.map(p => permissionMap[p]);
        await Role.findOneAndUpdate(
            { name: 'Employee' },
            {
                ...roleDefinitions.employee,
                permissions: empPermIds
            },
            { upsert: true, new: true }
        );
        console.log('Roles Seeded');

        // Re-fetch roles to get IDs for migration
        const adminRole = await Role.findOne({ name: 'Admin' });
        const hrRole = await Role.findOne({ name: 'HR' });
        const empRole = await Role.findOne({ name: 'Employee' });

        // 3. Migrate Users
        console.log('Migrating Users...');

        // Update Admin Users
        const adminUpdate = await mongoose.connection.db.collection('users').updateMany(
            { role: 'admin' },
            { $set: { role: adminRole._id } }
        );
        console.log(`Updated ${adminUpdate.modifiedCount} admin users`);

        const hrUpdate = await mongoose.connection.db.collection('users').updateMany(
            { role: 'hr' },
            { $set: { role: hrRole._id } }
        );
        console.log(`Updated ${hrUpdate.modifiedCount} hr users`);

        const empUpdate = await mongoose.connection.db.collection('users').updateMany(
            { role: 'employee' },
            { $set: { role: empRole._id } }
        );
        console.log(`Updated ${empUpdate.modifiedCount} employee users`);

        console.log('Migration Complete');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seed();
