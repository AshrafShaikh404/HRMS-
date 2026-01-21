const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        console.log('--- USERS ---');
        users.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role} (Type: ${typeof u.role})`);
        });

        const roles = await mongoose.connection.db.collection('roles').find({}).toArray();
        console.log('--- ROLES ---');
        roles.forEach(r => {
            console.log(`Role: ${r.name}, ID: ${r._id}`);
        });

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

debug();
