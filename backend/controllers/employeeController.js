const Employee = require('../models/Employee');
const User = require('../models/User');
const Department = require('../models/Department');
const Designation = require('../models/Designation');
const Location = require('../models/Location');
const Role = require('../models/Role');

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
        'firstName', 'lastName', 'email', 'phone', 'salary', 'address', 'city', 'state',
        'pinCode', 'bankAccount', 'panCard', 'aadharCard'
    ];
    let filled = 0;
    fields.forEach(f => {
        if (data[f]) filled++;
    });

    // Check nested
    if (data.jobInfo?.department) filled++;
    if (data.jobInfo?.designation) filled++;
    if (data.employmentDetails?.employmentType) filled++;
    if (data.employmentDetails?.joinDate || data.employmentDetails?.joiningDate) filled++;

    const totalFields = fields.length + 4;
    return Math.round((filled / totalFields) * 100);
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

            // Nested Job Info
            jobInfo = {},

            // Nested Employment Details
            employmentDetails = {},

            salary,
            bankAccount,
            panCard,
            aadharCard,
            uan,
            pfNumber,
            esiNumber
        } = req.body;

        const { department, designation, location, reportingManager } = jobInfo;
        const { employmentType, employmentStatus, joinDate, probationPeriod, confirmationDate } = employmentDetails;

        // Validations
        // 1. Check Email
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ success: false, message: 'User with this email already exists' });

        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) return res.status(400).json({ success: false, message: 'Employee with this email already exists' });

        // 2. Check Phone
        const existingPhone = await Employee.findOne({ phone });
        if (existingPhone) return res.status(400).json({ success: false, message: 'Employee with this phone number already exists' });

        // 3. Resolve References (Department, Designation, Location) for Legacy String & Valid ID check
        // We expect IDs from frontend now, but let's handle if they send strings (unlikely if we update FE)
        // Assume IDs.

        const deptObj = await Department.findById(department);
        if (!deptObj) return res.status(400).json({ success: false, message: 'Invalid Department ID' });

        const desigObj = await Designation.findById(designation);
        if (!desigObj) return res.status(400).json({ success: false, message: 'Invalid Designation ID' });

        let locObj = null;
        if (location) {
            locObj = await Location.findById(location);
            if (!locObj) return res.status(400).json({ success: false, message: 'Invalid Location ID' });
        }

        // 4. Validate Reporting Manager
        if (reportingManager) {
            const manager = await User.findById(reportingManager);
            if (!manager) return res.status(400).json({ success: false, message: 'Reporting Manager not found' });
            if (manager.status !== 'active') return res.status(400).json({ success: false, message: 'Reporting Manager is not active' });
        }

        // 5. Statutory Validation
        const isPfEligible = Number(salary) <= 15000;
        const isEsiEligible = Number(salary) <= 21000;

        if (isPfEligible && !uan) return res.status(400).json({ success: false, message: 'UAN is required for PF eligible employees (Salary <= 15000)' });
        if (isEsiEligible && !esiNumber) return res.status(400).json({ success: false, message: 'ESI Number is required for ESI eligible employees (Salary <= 21000)' });

        // Auto-calculate Confirmation Date if not provided
        let finalConfirmationDate = confirmationDate;
        if (!finalConfirmationDate && joinDate && probationPeriod) {
            const join = new Date(joinDate);
            join.setDate(join.getDate() + Number(probationPeriod));
            finalConfirmationDate = join;
        }

        // Generate Password
        if (password && password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
        const tempPassword = password || Math.random().toString(36).slice(-8);

        // Find employee role ID (Case-insensitive)
        const employeeRole = await Role.findOne({ name: { $regex: /^employee$/i } });
        if (!employeeRole) {
            console.error('CRITICAL: Employee role not found in database');
            return res.status(500).json({ success: false, message: 'Employee role configuration missing' });
        }

        // Create User
        createdUser = await User.create({
            name: `${firstName} ${lastName}`,
            email,
            passwordHash: tempPassword,
            role: employeeRole._id,
            status: 'active',
            createdBy: req.user._id
        });

        // 6. Calculate Profile Completion
        const profileCompletion = calculateProfileCompletion({ ...req.body, location: locObj?.name });

        // Create Employee
        const employee = await Employee.create({
            userId: createdUser._id,
            firstName, lastName, email, phone,
            dateOfBirth, gender,
            address, city, state, pinCode,
            emergencyContact,

            // New Structure
            jobInfo: {
                department: deptObj._id,
                designation: desigObj._id,
                location: locObj?._id,
                reportingManager: reportingManager || null // User ID
                // Note: user cannot report to self here strictly because they are just being created
            },
            employmentDetails: {
                employmentType,
                employmentStatus: employmentStatus || 'Active',
                joiningDate: joinDate || Date.now(),
                probationPeriod: probationPeriod || 0,
                confirmationDate: finalConfirmationDate
            },

            // Legacy Fields (Populate with Names for backward compat)
            department: deptObj.name,
            designation: desigObj.name,
            employmentType: employmentType, // String matches
            joinDate: joinDate || Date.now(),

            salary,
            bankAccount, panCard, aadharCard,
            uan, pfNumber, esiNumber,
            isPfEligible, isEsiEligible,
            profileCompletion,
            status: 'active',
            createdBy: req.user._id
        });

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

        // If employee role, check if accessing own data
        if (req.user.role === 'employee') {
            if (employee.userId.toString() !== req.user._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to update this employee'
                });
            }

            // Allow only specific fields for employee
            const allowedFields = ['phone', 'address', 'city', 'state', 'pinCode', 'emergencyContact', 'bankAccount'];

            allowedFields.forEach(field => {
                if (req.body[field] !== undefined) {
                    employee[field] = req.body[field];
                }
            });

        } else {
            // Admin and HR can update all fields except employeeCode
            const {
                employeeCode,
                jobInfo,
                employmentDetails,
                ...otherUpdates
            } = req.body;

            // 1. Handle Nested Job Info
            if (jobInfo) {
                // If reportingManager is being updated, validate it
                if (jobInfo.reportingManager) {
                    // Prevent self-reporting
                    if (jobInfo.reportingManager === employee._id.toString()) {
                        return res.status(400).json({ success: false, message: 'Employee cannot report to themselves' });
                    }
                    if (jobInfo.reportingManager === employee.userId.toString()) { // Check User ID match too just in case
                        return res.status(400).json({ success: false, message: 'Employee cannot report to themselves (User ID match)' });
                    }

                    // Check if manager exists and is active
                    // Ideally check against Employee or User. Model says ref: 'User'.
                    const manager = await User.findById(jobInfo.reportingManager);
                    if (!manager) return res.status(400).json({ success: false, message: 'Reporting Manager not found' });
                    if (manager.status !== 'active') return res.status(400).json({ success: false, message: 'Reporting Manager is not active' });
                }

                // Merge jobInfo
                employee.jobInfo = {
                    ...employee.jobInfo,
                    ...jobInfo
                };

                // Sync Legacy Fields (Fetch names if IDs changed)
                if (jobInfo.department) {
                    const dept = await Department.findById(jobInfo.department);
                    if (dept) employee.department = dept.name;
                }
                if (jobInfo.designation) {
                    const desig = await Designation.findById(jobInfo.designation);
                    if (desig) employee.designation = desig.name;
                }
            }

            // 2. Handle Nested Employment Details
            if (employmentDetails) {
                employee.employmentDetails = {
                    ...employee.employmentDetails,
                    ...employmentDetails
                };

                // Sync Legacy
                if (employmentDetails.employmentType) {
                    employee.employmentType = employmentDetails.employmentType;
                }
                if (employmentDetails.joiningDate) {
                    employee.joinDate = employmentDetails.joiningDate;
                }
            }

            // 3. Update top-level fields
            Object.keys(otherUpdates).forEach(key => {
                employee[key] = otherUpdates[key];
            });

            // Recalculate Profile Completion
            const completionData = { ...employee.toObject(), ...otherUpdates, ...employee.jobInfo, ...employee.employmentDetails };
            // Note: location name might be missing here if only ID is in jobInfo, but it's an approximation.
            employee.profileCompletion = calculateProfileCompletion(completionData);
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

        // Update employee with atomic $push to prevent race conditions
        const userRoleName = req.user.role?.name?.toLowerCase();
        const isAdminOrHR = userRoleName === 'admin' || userRoleName === 'hr';

        const newDocument = {
            name: req.body.documentType || 'Document',
            type: req.file.mimetype,
            filePath: req.file.path,
            uploadDate: new Date(),
            status: isAdminOrHR ? 'Verified' : 'Pending',
            verifiedBy: isAdminOrHR ? req.user._id : undefined,
            verifiedAt: isAdminOrHR ? new Date() : undefined
        };

        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { $push: { documents: newDocument } },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                documentId: updatedEmployee.documents[updatedEmployee.documents.length - 1]._id,
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

// @desc    Get my employee profile
// @route   GET /api/v1/employees/me
// @access  Private
exports.getMyProfile = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id })
            .populate('jobInfo.department')
            .populate('jobInfo.designation')
            .populate('jobInfo.location')
            .populate('jobInfo.reportingManager');

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee profile not found. Please contact HR.'
            });
        }

        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('Get my profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employee profile',
            error: error.message
        });
    }
};
