const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('./models/Employee');

// Load env vars
dotenv.config();

const fixEmployees = async () => {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/hrms";
        await mongoose.connect(uri);
        console.log(`MongoDB connected to ${uri}`);

        // Update Farhan and Ashraf to active
        const result = await Employee.updateMany(
            { email: { $in: ['farhan123@gmail.com', 'ashrf@gmail.com'] } },
            { $set: { status: 'active' } }
        );

        console.log('Update Result:', result);
        process.exit();
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

fixEmployees();
