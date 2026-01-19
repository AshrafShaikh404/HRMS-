const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Get all employees with pagination and filters
// @route   GET /api/v1/employees
// @access  Private (Admin, HR)
exports.getEmployees = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Build query
        let query = {};

        // Filters
        if (req.query.department) {
            query.department = req.query.department;
        }
        if (req.query.status) {
            query.status = req.query.status;
        }
        if (req.query.search) {
            query.$or = [
                { firstName: { $regex: req.query.search, $options: 'i' } },
                { lastName: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
                { employeeCode: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const employees = await Employee.find(query)
            .select('-documents -__v')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalRecords = await Employee.countDocuments(query);
        const totalPages = Math.ceil(totalRecords / limit);

        res.status(200).json({
            success: true,
            data: {
                employees,
                pagination: {
                    totalRecords,
                    totalPages,
                    currentPage: page,
                    limit
                }
            }
        });
    } catch (error) {
        console.error('Get employees error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// @desc    Get single employee
// @route   GET /api/v1/employees/:id
// @access  Private (Admin, HR, Employee - own only)
exports.getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // If employee role, check if accessing own data
        if (req.user.role === 'employee' && employee.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this employee data'
            });
        }

        res.status(200).json({
            success: true,
            data: { employee }
        });
    } catch (error) {
        console.error('Get employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

// Helper: Calculate Profile Completion
const calculateProfileCompletion = (data) => {
    const fields = [
        'firstName', 'lastName', 'email', 'phone', 'department', 'designation',
        'employmentType', 'joinDate', 'salary', 'address', 'city', 'state',
        'pinCode', 'emergencyContact', 'bankAccount', 'panCard', 'aadharCard'
    ];
    let filled = 0;
    fields.forEach(f => {
        if (data[f]) filled++;
    });
    return Math.round((filled / fields.length) * 100);
};

// Helper: Mock Send Email
const sendOnboardingEmail = (email, password) => {
    console.log(`[EMAIL SERVICE] Sending onboarding email to ${email}`);
    console.log(`[EMAIL SERVICE] Credentials - Email: ${email}, Password: ${password}`);
};

// @desc    Create new employee
// @route   POST /api/v1/employees
// @access  Private (Admin, HR)
exports.createEmployee = async (req, res) => {
    let createdUser = null;

    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth,
            gender,
            address,
            city,
            state,
            pinCode,
            emergencyContact,
            department,
            designation,
            employmentType,
            joinDate,
            salary,
            bankAccount,
            panCard,
            aadharCard,
            uan,
            pfNumber,
            esiNumber
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User with this email already exists' });
        }
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
        }

        // Logic: Statutory Eligibility based on Salary
        // PF Mandatory if Salary <= 15000
        const isPfEligible = Number(salary) <= 15000;
        // ESI Mandatory if Salary <= 21000
        const isEsiEligible = Number(salary) <= 21000;

        // Validation: If Eligible, numbers should be provided (Frontend should enforce, Backend double check)
        if (isPfEligible && !uan) {
            // Depending on strictness, we might error or just warn. Let's warn but allow creation if missing for now, 
            // as some might not have UAN yet generated. But requirement says "UAN... required if eligible".
            // Let's enforce it strictly for quality.
            if (!uan) return res.status(400).json({ success: false, message: 'UAN is required for PF eligible employees (Salary <= 15000)' });
        }
        if (isEsiEligible && !esiNumber) {
            if (!esiNumber) return res.status(400).json({ success: false, message: 'ESI Number is required for ESI eligible employees (Salary <= 21000)' });
        }

        // Check if phone already exists
        const existingPhone = await Employee.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ success: false, message: 'Employee with this phone number already exists' });
        }

        // Validate Password Length if provided
        if (password && password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        }

        // Use provided password or generate temporary one
        const tempPassword = password || Math.random().toString(36).slice(-8);

        // Create user first
        createdUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            passwordHash: tempPassword,
            role: 'employee',
            status: 'active',
            createdBy: req.user._id
        });

        const profileCompletion = calculateProfileCompletion(req.body);

        // Create employee
        const employee = await Employee.create({
            userId: createdUser._id,
            firstName, lastName, email, phone,
            dateOfBirth, gender,
            address, city, state, pinCode,
            emergencyContact,
            department, designation, employmentType,
            joinDate: joinDate || Date.now(),
            salary,
            bankAccount, panCard, aadharCard,
            uan, pfNumber, esiNumber,
            isPfEligible, isEsiEligible,
            profileCompletion,
            status: 'active',
            createdBy: req.user._id
        });

        // Send Email
        sendOnboardingEmail(email, tempPassword);

        res.status(201).json({
            success: true,
            message: 'Employee created successfully',
            data: {
                employee,
                generatedPassword: tempPassword
            }
        });
    } catch (error) {
        console.error('Create employee error:', error);
        if (createdUser) await User.findByIdAndDelete(createdUser._id).catch(e => console.error(e));
        res.status(500).json({
            success: false,
            message: 'Error creating employee',
            error: error.message
        });
    }
};

// @desc    Update employee
// @route   PUT /api/v1/employees/:id
// @access  Private (Admin, HR, Employee - limited fields)
exports.updateEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // If employee role, check if updating own data and restrict fields
        if (req.user.role === 'employee') {
            if (employee.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this employee'
                });
            }

            // Allow only specific fields for employee
            const allowedFields = ['phone', 'address', 'city', 'state', 'pinCode', 'emergencyContact', 'bankAccount'];
            const updateData = {};
            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            });

            Object.assign(employee, updateData);
        } else {
            // Admin and HR can update all fields except employeeCode
            const { employeeCode, ...updateData } = req.body;
            Object.assign(employee, updateData);
        }

        await employee.save();

        res.status(200).json({
            success: true,
            message: 'Employee updated successfully',
            data: { employee }
        });
    } catch (error) {
        console.error('Update employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// @desc    Delete employee (soft delete)
// @route   DELETE /api/v1/employees/:id
// @access  Private (Admin, HR)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Hard Delete: Permanently remove employee
        await Employee.findByIdAndDelete(req.params.id);

        // Also permanently delete the associated user account
        if (employee.userId) {
            await User.findByIdAndDelete(employee.userId);
        }

        res.status(200).json({
            success: true,
            message: 'Employee permanently deleted'
        });
    } catch (error) {
        console.error('Delete employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

// @desc    Upload employee document
// @route   POST /api/v1/employees/:id/documents
// @access  Private (Admin, HR, Employee - own only)
exports.uploadDocument = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        // Check authorization
        if (req.user.role === 'employee' && employee.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to upload documents for this employee'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        // Add document to employee
        employee.documents.push({
            name: req.body.documentType || 'Document',
            type: req.file.mimetype,
            filePath: req.file.path,
            uploadDate: new Date()
        });

        await employee.save();

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                documentId: employee.documents[employee.documents.length - 1]._id,
                fileName: req.file.filename,
                uploadedAt: new Date()
            }
        });
    } catch (error) {
        console.error('Upload document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading document',
            error: error.message
        });
    }
};

// @desc    Verify employee document
// @route   PUT /api/v1/employees/:id/documents/:docId/verify
// @access  Private (Admin, HR)
exports.verifyDocument = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body; // status: 'Verified' or 'Rejected'
        const employee = await Employee.findById(req.params.id);

        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const document = employee.documents.id(req.params.docId);
        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        document.status = status;
        document.verifiedBy = req.user._id;
        document.verifiedAt = new Date();
        document.rejectionReason = status === 'Rejected' ? rejectionReason : undefined;

        await employee.save();

        res.status(200).json({
            success: true,
            message: `Document ${status.toLowerCase()} successfully`,
            data: document
        });
    } catch (error) {
        console.error('Verify document error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying document',
            error: error.message
        });
    }
};
