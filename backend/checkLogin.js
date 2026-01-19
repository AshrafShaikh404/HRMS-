require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const run = async () => {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@hrms.com';
  const password = args[1] || 'admin123';

  try {
    await connectDB();

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) {
      console.log(`User not found: ${email}`);
      process.exit(1);
    }

    console.log(`Found user: ${user.email} (status=${user.status}, role=${user.role})`);

    const match = await user.comparePassword(password);
    console.log(`Password match: ${match}`);

    // print hashed password length (do not expose in prod)
    console.log(`Stored passwordHash length: ${user.passwordHash?.length || 0}`);

    process.exit(match ? 0 : 2);
  } catch (err) {
    console.error('Error checking login:', err.message);
    process.exit(3);
  }
};

run();
