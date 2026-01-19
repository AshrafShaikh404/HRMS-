require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

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

const seedUsers = async () => {
    try {
        await connectDB();

        // Get admin user
        const admin = await User.findOne({ email: 'admin@hrms.com' });
        if (!admin) {
            console.log('❌ Admin user not found. Run seedAdmin.js first.');
            process.exit(1);
        }

        console.log('🌱 Creating HR and Employee Users...\n');

        // 1. Create HR User
        console.log('1️⃣  Creating HR User...');
        const hrUserExists = await User.findOne({ email: 'hr@hrms.com' });

        if (hrUserExists) {
            console.log('   ⚠️  HR user already exists');
        } else {
            await User.create({
                name: 'HR Manager',
                email: 'hr@hrms.com',
                passwordHash: 'hr123',
                role: 'hr',
                status: 'active',
                createdBy: admin._id
            });
            console.log('   ✅ HR user created');
        }

        // 2. Create Sample Employee Users
        console.log('\n2️⃣  Creating Employee Users...');

        const employees = [
            { name: 'John Doe', email: 'john.doe@hrms.com' },
            { name: 'Jane Smith', email: 'jane.smith@hrms.com' },
            { name: 'Mike Wilson', email: 'mike.wilson@hrms.com' }
        ];

        for (const empData of employees) {
            const userExists = await User.findOne({ email: empData.email });

            if (userExists) {
                console.log(`   ⚠️  ${empData.name} already exists`);
                continue;
            }

            await User.create({
                name: empData.name,
                email: empData.email,
                passwordHash: 'emp123',
                role: 'employee',
                status: 'active',
                createdBy: admin._id
            });

            console.log(`   ✅ ${empData.name} created`);
        }

        console.log('\n✅ User seeding completed!\n');
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
        console.error('❌ Error seeding users:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

seedUsers();
