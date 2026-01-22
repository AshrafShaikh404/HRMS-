const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Employee = require('./models/Employee');
const Role = require('./models/Role');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hrms');
        console.log('MongoDB Connected\n');
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

const debugUser = async (email) => {
    await connectDB();

    try {
        console.log(`=== Debugging User: ${email} ===\n`);

        // 1. Find User
        const user = await User.findOne({ email }).populate('role');
        if (!user) {
            console.log('❌ User NOT FOUND');
            return;
        }

        console.log('✅ User Found:');
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - User ID: ${user._id}`);
        console.log(`   - Role: ${user.role ? user.role.name : 'NO ROLE'}`);
        console.log(`   - Role ID: ${user.role ? user.role._id : 'N/A'}\n`);

        // 2. Check Role Permissions
        if (user.role) {
            const role = await Role.findById(user.role._id).populate('permissions');
            console.log('📋 Role Permissions:');
            if (role && role.permissions && role.permissions.length > 0) {
                role.permissions.forEach(p => {
                    console.log(`   - ${p.name || p}`);
                });
            } else {
                console.log('   ⚠️  No permissions found');
            }
            console.log('');
        }

        // 3. Find Employee
        const employee = await Employee.findOne({ userId: user._id });
        if (!employee) {
            console.log('❌ Employee Profile NOT LINKED');
            console.log('   This is why "Employee Profile Not Found" appears\n');
        } else {
            console.log('✅ Employee Profile Found:');
            console.log(`   - Employee Code: ${employee.employeeCode}`);
            console.log(`   - Name: ${employee.firstName} ${employee.lastName}`);
            console.log(`   - Email: ${employee.email}`);
            console.log(`   - Employee ID: ${employee._id}\n`);
        }

        // 4. Check alternative lookups
        const empByEmail = await Employee.findOne({ email: user.email });
        if (empByEmail && empByEmail._id.toString() !== employee?._id?.toString()) {
            console.log('⚠️  Found DIFFERENT employee with same email:');
            console.log(`   - Employee Code: ${empByEmail.employeeCode}`);
            console.log(`   - Linked User ID: ${empByEmail.userId}`);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

// Get email from command line or use default
const email = process.argv[2] || 'asrafsk756@gmail.com';
debugUser(email);
