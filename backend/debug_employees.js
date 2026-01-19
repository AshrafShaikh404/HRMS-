const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Load env vars
dotenv.config();

const checkEmployees = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/hrms";
        await mongoose.connect(uri);
        console.log(`MongoDB connected to ${uri}`);

        // Targeted employees from screenshot
        // Farhan Khalifa (email: farhan123@gmail.com)
        // Shaikh Ashraf.A (email: ashrf@gmail.com)

        const employees = await Employee.find({
            email: { $in: ['farhan123@gmail.com', 'ashrf@gmail.com'] }
        }).select('firstName lastName email status employeeCode dates');

        console.log('--- DB RESULTS ---');
        if (employees.length === 0) {
            console.log('No matching employees found.');
        } else {
            employees.forEach(emp => {
                console.log(`Code: ${emp.employeeCode}, Name: ${emp.firstName} ${emp.lastName}, Email: ${emp.email}, Status: ${emp.status}`);
            });
        }
        console.log('------------------');

        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

checkEmployees();
