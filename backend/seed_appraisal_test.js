const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Role = require('./models/Role');
const ReviewCycle = require('./models/ReviewCycle');
const PerformanceReview = require('./models/PerformanceReview');
const AppraisalCycle = require('./models/AppraisalCycle');
const AppraisalRecord = require('./models/AppraisalRecord');
const SalaryStructure = require('./models/SalaryStructure');

const seedTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms');
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ email: 'admin@hrms.com' });
        const ashrafUser = await User.findOne({ email: 'ashraf@hrms.com' });

        if (ashrafUser) {
            ashrafUser.passwordHash = 'emp123';
            await ashrafUser.save();
            console.log('Reset Ashraf password to emp123');
        }

        const ashrafEmployee = await Employee.findOne({ email: 'ashraf@hrms.com' });

        if (!ashrafEmployee) {
            console.error('Ashraf employee not found');
            process.exit(1);
        }

        // 1. Create Review Cycle
        const reviewCycle = await ReviewCycle.create({
            name: 'Verification Review Cycle 2026',
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-06-30'),
            status: 'Active',
            createdBy: adminUser._id
        });
        console.log('Created Review Cycle:', reviewCycle._id);

        // 2. Create Performance Review
        const performanceReview = await PerformanceReview.create({
            employeeId: ashrafEmployee._id,
            reviewCycleId: reviewCycle._id,
            finalRating: 4.5,
            status: 'Finalized',
            createdBy: adminUser._id
        });
        console.log('Created Performance Review:', performanceReview._id);

        // 3. Create Appraisal Cycle
        const appraisalCycle = await AppraisalCycle.create({
            name: 'Verification Appraisal Cycle 2026',
            linkedReviewCycle: reviewCycle._id,
            status: 'Active',
            effectiveFrom: new Date('2026-07-01'),
            createdBy: adminUser._id
        });
        console.log('Created Appraisal Cycle:', appraisalCycle._id);

        // 4. Create Appraisal Record
        const oldSalary = ashrafEmployee.salary || 50000;
        const incrementValue = 5000;
        const appraisalRecord = await AppraisalRecord.create({
            employeeId: ashrafEmployee._id,
            appraisalCycleId: appraisalCycle._id,
            finalRating: 4.5,
            incrementType: 'Fixed',
            incrementValue: incrementValue,
            oldCTC: oldSalary,
            newCTC: oldSalary + incrementValue,
            effectiveFrom: appraisalCycle.effectiveFrom,
            status: 'Approved',
            approvedBy: adminUser._id,
            remarks: 'Excellent performance in H1 2026. Keep it up!'
        });
        console.log('Created Appraisal Record:', appraisalRecord._id);

        // 5. Update Employee Salary (as per controller logic)
        ashrafEmployee.salary = oldSalary + incrementValue;
        await ashrafEmployee.save();
        console.log('Updated Employee Salary');

        // 6. Create Salary Structure (as per controller logic)
        const newBasic = ashrafEmployee.salary * 0.40;
        const newHRA = newBasic * 0.40;
        await SalaryStructure.create({
            employeeId: ashrafEmployee._id,
            basicSalary: Math.round(newBasic),
            hra: Math.round(newHRA),
            isActive: true,
            effectiveFrom: appraisalCycle.effectiveFrom
        });
        console.log('Created Salary Structure');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

seedTestData();
