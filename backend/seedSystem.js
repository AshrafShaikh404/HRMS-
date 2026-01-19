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
        console.log('MongoDB Connected\n');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedSystem = async () => {
    try {
        await connectDB();

        // Get admin user
        const admin = await User.findOne({ email: 'admin@hrms.com' });
        if (!admin) {
            console.log('❌ Admin user not found. Run seedAdmin.js first.');
            process.exit(1);
        }

        console.log('🌱 Seeding HRMS System with Test Data...\n');

        // 1. Create HR User
        console.log('1️⃣  Creating HR User...');
        const hrUserExists = await User.findOne({ email: 'hr@hrms.com' });
        let hrUser;

        if (hrUserExists) {
            console.log('   ⚠️  HR user already exists');
            hrUser = hrUserExists;
        } else {
            hrUser = await User.create({
                name: 'HR Manager',
                email: 'hr@hrms.com',
                passwordHash: 'hr123',
                role: 'hr',
                status: 'active',
                createdBy: admin._id
            });
            console.log('   ✅ HR user created');
        }

        // 2. Create HR Employee Record
        console.log('\n2️⃣  Creating HR Employee Record...');
        const hrEmpExists = await Employee.findOne({ userId: hrUser._id });

        if (hrEmpExists) {
            console.log('   ⚠️  HR employee record already exists');
        } else {
            await Employee.create({
                userId: hrUser._id,
                firstName: 'Sarah',
                lastName: 'Johnson',
                email: 'hr@hrms.com',
                phone: '9876543210',
                dateOfBirth: new Date('1988-05-15'),
                gender: 'F',
                address: '456 HR Avenue',
                city: 'New York',
                state: 'NY',
                pinCode: '10002',
                department: 'HR',
                designation: 'HR Manager',
                joinDate: new Date('2020-01-15'),
                salary: 75000,
                status: 'active',
                createdBy: admin._id
            });
            console.log('   ✅ HR employee record created');
        }

        // 3. Create Sample Employees
        console.log('\n3️⃣  Creating Sample Employees...');

        const employees = [
            {
                name: 'John Doe',
                email: 'john.doe@hrms.com',
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890',
                department: 'IT',
                designation: 'Software Engineer',
                salary: 60000,
                gender: 'M',
                dateOfBirth: new Date('1992-03-20')
            },
            {
                name: 'Jane Smith',
                email: 'jane.smith@hrms.com',
                firstName: 'Jane',
                lastName: 'Smith',
                phone: '2345678901',
                department: 'Finance',
                designation: 'Accountant',
                salary: 55000,
                gender: 'F',
                dateOfBirth: new Date('1990-07-10')
            },
            {
                name: 'Mike Wilson',
                email: 'mike.wilson@hrms.com',
                firstName: 'Mike',
                lastName: 'Wilson',
                phone: '3456789012',
                department: 'Sales',
                designation: 'Sales Executive',
                salary: 50000,
                gender: 'M',
                dateOfBirth: new Date('1993-11-25')
            }
        ];

        for (const empData of employees) {
            const userExists = await User.findOne({ email: empData.email });

            if (userExists) {
                console.log(`   ⚠️  ${empData.name} already exists`);
                continue;
            }

            // Create user
            const user = await User.create({
                name: empData.name,
                email: empData.email,
                passwordHash: 'emp123',
                role: 'employee',
                status: 'active',
                createdBy: admin._id
            });

            // Create employee
            await Employee.create({
                userId: user._id,
                firstName: empData.firstName,
                lastName: empData.lastName,
                email: empData.email,
                phone: empData.phone,
                dateOfBirth: empData.dateOfBirth,
                gender: empData.gender,
                address: `${empData.firstName}'s Address`,
                city: 'New York',
                state: 'NY',
                pinCode: '10001',
                department: empData.department,
                designation: empData.designation,
                joinDate: new Date('2023-01-01'),
                salary: empData.salary,
                status: 'active',
                createdBy: admin._id
            });

            console.log(`   ✅ ${empData.name} created`);
        }

        console.log('\n✅ System seeding completed!\n');
        console.log('═══════════════════════════════════════');
        console.log('📋 LOGIN CREDENTIALS');
        console.log('═══════════════════════════════════════');
        console.log('\n👨‍💼 ADMIN:');
        console.log('   Email: admin@hrms.com');
        console.log('   Password: admin123');
        console.log('\n👥 HR MANAGER:');
        console.log('   Email: hr@hrms.com');
        console.log('   Password: hr123');
        console.log('\n👷 EMPLOYEES (all use password: emp123):');
        console.log('   - john.doe@hrms.com');
        console.log('   - jane.smith@hrms.com');
        console.log('   - mike.wilson@hrms.com');
        console.log('\n═══════════════════════════════════════\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding system:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

seedSystem();
