const User = require('../models/User');
const Employee = require('../models/Employee');
const { generateToken } = require('../middleware/auth.middleware');
const admin = require('../config/firebaseAdmin');
const crypto = require('crypto');
const PERMISSIONS = require('../config/permissions');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Private (Admin only)
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, status } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            passwordHash: password,
            role: role || (await require('../models/Role').findOne({ name: 'Employee' }))._id,
            status: status || 'active',
            createdBy: req.user?._id || null

        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                permissions: user.role && user.role.permissions && user.role.permissions.length > 0
                    ? user.role.permissions.map(p => p.name || p)
                    : (PERMISSIONS[user.role.name?.toLowerCase()] || [])
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log(`Login attempt: ${email}`);

        // Find user and include password
        const user = await User.findOne({ email })
            .select('+passwordHash')
            .populate({
                path: 'role',
                populate: {
                    path: 'permissions'
                }
            });

        if (!user) {
            console.warn(`Login failed: user not found for email=${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                ...(process.env.NODE_ENV !== 'production' && { reason: 'user-not-found' })
            });
        }

        console.log(`User found: ${email} (status=${user.status}, role=${user.role})`);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Your account is inactive. Please contact administrator.',
                ...(process.env.NODE_ENV !== 'production' && { reason: 'inactive' })
            });
        }

        // Check password
        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            console.warn(`Login failed: invalid password for email=${email}`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
                ...(process.env.NODE_ENV !== 'production' && { reason: 'bad-password' })
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        const roleName = user.role.name.toLowerCase();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.role && user.role.permissions && user.role.permissions.length > 0
                    ? user.role.permissions.map(p => p.name || p)
                    : (PERMISSIONS[roleName] || [])
            },
            expiresIn: process.env.JWT_EXPIRE || '7d'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// @desc    Google Login
// @route   POST /api/v1/auth/google-login
// @access  Public
exports.googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ success: false, message: 'Token is required' });
        }

        // Verify Firebase Token
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(token);
        } catch (authError) {
            console.error("Firebase Auth Verification Failed:", authError);
            return res.status(401).json({ success: false, message: 'Invalid or expired Google token' });
        }

        const { email, name, picture } = decodedToken;

        console.log(`Google Login attempt: ${email}`);

        // Check if user exists
        let user = await User.findOne({ email }).populate({
            path: 'role',
            populate: { path: 'permissions' }
        });

        if (user) {
            // Check if user is active
            if (user.status !== 'active') {
                return res.status(401).json({
                    success: false,
                    message: 'Your account is inactive. Please contact administrator.',
                });
            }
        } else {
            // Create new user (Auto-register)
            console.log(`Creating new user via Google Login: ${email}`);
            const randomPassword = crypto.randomBytes(16).toString('hex');

            // Default role is Employee. Fetch it first.
            const employeeRole = await require('../models/Role').findOne({ name: 'Employee' });

            user = await User.create({
                name: name || 'Google User',
                email: email,
                passwordHash: randomPassword,
                role: employeeRole._id,
                status: 'active'
            });

            // Create associated Employee record
            try {
                const count = await Employee.countDocuments();
                const employeeCode = `EMP${String(count + 1).padStart(3, '0')}`;

                const nameParts = (name || 'Google User').split(' ');
                const firstName = nameParts[0];
                const lastName = nameParts.slice(1).join(' ') || '';

                await Employee.create({
                    userId: user._id,
                    employeeCode: employeeCode,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    department: 'General',
                    designation: 'New Joinee',
                    employmentType: 'Full-time',
                    phone: '0000000000',
                    joinDate: new Date(),
                    status: 'active',
                    salary: 0,
                    leaveBalance: {
                        casualLeave: 12,
                        sickLeave: 12,
                        earnedLeave: 0
                    }
                });
                console.log(`Created employee record for ${email}`);
            } catch (empError) {
                console.error("Error creating employee record:", empError);
            }

            // Re-fetch with population
            user = await User.findById(user._id).populate({
                path: 'role',
                populate: { path: 'permissions' }
            });
        }

        // Generate JWT
        const jwtToken = generateToken(user._id);

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        const roleName = user.role.name ? user.role.name.toLowerCase() : 'employee';

        res.status(200).json({
            success: true,
            message: 'Google Login successful',
            token: jwtToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                picture,
                permissions: PERMISSIONS[roleName] || []
            }
        });

    } catch (error) {
        console.error('Google Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing Google Login',
            error: error.message
        });
    }
};

// @desc    Change password
// @route   POST /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.user._id).select('+passwordHash');

        // Check current password
        const isPasswordMatch = await user.comparePassword(currentPassword);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        user.passwordHash = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error.message
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'role',
            populate: { path: 'permissions' }
        });

        // Get employee details if role is employee or hr
        const roleName = user.role?.name?.toLowerCase();
        let employeeDetails = null;
        if (roleName === 'employee' || roleName === 'hr') {
            employeeDetails = await Employee.findOne({ userId: user._id })
                .populate('jobInfo.department')
                .populate('jobInfo.designation')
                .populate('jobInfo.location')
                .populate('jobInfo.reportingManager');
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...user.toObject(),
                    permissions: user.role && user.role.permissions && user.role.permissions.length > 0
                        ? user.role.permissions.map(p => p.name || p)
                        : (PERMISSIONS[roleName] || [])
                },
                employee: employeeDetails
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user data',
            error: error.message
        });
    }
};
// @desc    Get all users (for Admin)
// @route   GET /api/v1/auth/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res) => {
    try {
        // In JWT, logout is handled on client side by removing token
        // Here we just send a success response
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};
