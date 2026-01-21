const mongoose = require('mongoose');
const LeaveType = require('./models/LeaveType');
const LeavePolicy = require('./models/LeavePolicy');

const seedLeaveData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms');
        console.log('Connected to MongoDB');

        // Check if leave types already exist
        const existingTypes = await LeaveType.find();
        if (existingTypes.length > 0) {
            console.log('Leave types already exist. Skipping seed.');
            process.exit(0);
        }

        // Create default leave types
        const leaveTypes = await LeaveType.insertMany([
            {
                name: 'Casual Leave',
                code: 'CL',
                description: 'For personal or urgent matters',
                isPaid: true,
                maxDaysPerYear: 12,
                carryForwardLimit: 5,
                requiresApproval: true,
                color: '#3b82f6',
                affectsAttendance: true
            },
            {
                name: 'Sick Leave',
                code: 'SL',
                description: 'For medical reasons',
                isPaid: true,
                maxDaysPerYear: 10,
                carryForwardLimit: 0,
                requiresApproval: true,
                color: '#ef4444',
                affectsAttendance: true
            },
            {
                name: 'Earned Leave',
                code: 'EL',
                description: 'Earned after completing service period',
                isPaid: true,
                maxDaysPerYear: 15,
                carryForwardLimit: 10,
                requiresApproval: true,
                color: '#10b981',
                affectsAttendance: true
            },
            {
                name: 'Unpaid Leave',
                code: 'UL',
                description: 'Leave without pay',
                isPaid: false,
                maxDaysPerYear: 30,
                carryForwardLimit: 0,
                requiresApproval: true,
                color: '#6b7280',
                affectsAttendance: true
            }
        ]);

        console.log('✅ Created leave types:', leaveTypes.map(t => t.name).join(', '));

        // Create default leave policy
        const defaultPolicy = await LeavePolicy.create({
            name: 'Default Leave Policy',
            description: 'Standard leave policy for all employees',
            leaveTypes: [
                { leaveType: leaveTypes[0]._id, quota: 12, accrualFrequency: 'Yearly' }, // CL
                { leaveType: leaveTypes[1]._id, quota: 10, accrualFrequency: 'Yearly' }, // SL
                { leaveType: leaveTypes[2]._id, quota: 15, accrualFrequency: 'Yearly' }, // EL
                { leaveType: leaveTypes[3]._id, quota: 30, accrualFrequency: 'Yearly' }  // UL
            ],
            isActive: true
        });

        console.log('✅ Created default leave policy:', defaultPolicy.name);
        console.log('\n🎉 Leave data seeded successfully!');
        console.log('\nNext steps:');
        console.log('1. Restart your backend server');
        console.log('2. Refresh the frontend to see leave balances');
        console.log('3. Optionally assign this policy to employees via Employee model');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding leave data:', error);
        process.exit(1);
    }
};

// Load environment variables
require('dotenv').config();

seedLeaveData();
