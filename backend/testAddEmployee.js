require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const testAddEmployee = async () => {
    try {
        await connectDB();

        console.log('Testing employee creation...\n');

        // Get admin user
        const admin = await User.findOne({ email: 'admin@hrms.com' });
        if (!admin) {
            console.log('❌ Admin user not found');
            process.exit(1);
        }
        console.log('✅ Admin user found:', admin.email);

        // Test data
        const employeeData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@hrms.com',
            phone: '1234567890',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'M',
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            pinCode: '10001',
            emergencyContact: {
                name: 'Jane Doe',
                relationship: 'Spouse',
                phone: '0987654321'
            },
            department: 'IT',
            designation: 'Software Engineer',
            joinDate: new Date(),
            salary: 50000,
            bankAccount: '1234567890',
            panCard: 'ABCDE1234F',
            aadharCard: '123456789012'
        };

        // Check if employee already exists
        const existing = await Employee.findOne({ email: employeeData.email });
        if (existing) {
            console.log('⚠️  Employee already exists, deleting first...');
            await Employee.findByIdAndDelete(existing._id);
            if (existing.userId) {
                await User.findByIdAndDelete(existing.userId);
            }
        }

        // Create user first
        console.log('\n1. Creating User account...');
        const tempPassword = 'Test@123';
        const user = await User.create({
            name: `${employeeData.firstName} ${employeeData.lastName}`,
            email: employeeData.email,
            passwordHash: tempPassword,
            role: 'employee',
            status: 'active',
            createdBy: admin._id
        });
        console.log('✅ User created:', user.email);

        // Create employee
        console.log('\n2. Creating Employee record...');
        const employee = await Employee.create({
            userId: user._id,
            ...employeeData,
            status: 'active',
            createdBy: admin._id
        });
        console.log('✅ Employee created:', employee.employeeCode);

        console.log('\n📋 Summary:');
        console.log('-----------------------------------');
        console.log('Employee Code:', employee.employeeCode);
        console.log('Name:', employee.firstName, employee.lastName);
        console.log('Email:', employee.email);
        console.log('Department:', employee.department);
        console.log('Designation:', employee.designation);
        console.log('Login Password:', tempPassword);
        console.log('-----------------------------------');
        console.log('\n✅ Employee addition test SUCCESSFUL!');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

testAddEmployee();
