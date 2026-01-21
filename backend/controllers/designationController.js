const Designation = require('../models/Designation');
const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all designations
// @route   GET /api/v1/designations
// @access  Private (Admin/HR)
exports.getDesignations = async (req, res) => {
    try {
        const { departmentId } = req.query;
        let query = {};

        if (departmentId) {
            query.department = departmentId;
        }

        const designations = await Designation.find(query)
            .populate('department', 'name code')
            .sort({ level: 1, name: 1 });

        // Calculate employee count for each designation
        // Note: Currently Employee.designation is a String.
        // We will match by string name for now.
        const designationsWithCount = await Promise.all(designations.map(async (desig) => {
            const count = await Employee.countDocuments({
                designation: desig.name, // Matching by name
                status: 'active'
            });
            return {
                ...desig.toObject(),
                employeeCount: count
            };
        }));

        res.status(200).json({
            success: true,
            data: designationsWithCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching designations',
            error: error.message
        });
    }
};

// @desc    Create new designation
// @route   POST /api/v1/designations
// @access  Private (Admin)
exports.createDesignation = async (req, res) => {
    try {
        const { name, department, level, description } = req.body;

        // Verify department exists
        const deptExists = await Department.findById(department);
        if (!deptExists) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        if (!deptExists.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot create designation for inactive department'
            });
        }

        const designation = await Designation.create({
            name,
            department,
            level: level || 0,
            description,
            createdBy: req.user._id
        });

        const populatedDesignation = await Designation.findById(designation._id).populate('department', 'name code');

        res.status(201).json({
            success: true,
            message: 'Designation created successfully',
            data: populatedDesignation
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Designation with this name already exists in the selected department'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating designation',
            error: error.message
        });
    }
};

// @desc    Update designation
// @route   PUT /api/v1/designations/:id
// @access  Private (Admin)
exports.updateDesignation = async (req, res) => {
    try {
        const { name, department, level, description, isActive } = req.body;
        const designation = await Designation.findById(req.params.id);

        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }

        // If trying to deactivate, check for active employees
        if (isActive === false && designation.isActive === true) {
            const employeeCount = await Employee.countDocuments({
                designation: designation.name,
                status: 'active'
            });

            if (employeeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot deactivate designation with ${employeeCount} active employees`
                });
            }
        }

        // If changing department, verify new department exists
        if (department && department !== designation.department.toString()) {
            const deptExists = await Department.findById(department);
            if (!deptExists) {
                return res.status(404).json({
                    success: false,
                    message: 'Target Department not found'
                });
            }
        }

        if (name) designation.name = name;
        if (department) designation.department = department;
        if (level !== undefined) designation.level = level;
        if (description !== undefined) designation.description = description;
        if (isActive !== undefined) designation.isActive = isActive;

        await designation.save();

        const populatedDesignation = await Designation.findById(designation._id).populate('department', 'name code');

        res.status(200).json({
            success: true,
            message: 'Designation updated successfully',
            data: populatedDesignation
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Designation with this name already exists in the selected department'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating designation',
            error: error.message
        });
    }
};

// @desc    Delete designation
// @route   DELETE /api/v1/designations/:id
// @access  Private (Admin)
exports.deleteDesignation = async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);

        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }

        const employeeCount = await Employee.countDocuments({
            designation: designation.name
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete designation. ${employeeCount} employees are linked to it.`
            });
        }

        await designation.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Designation deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting designation',
            error: error.message
        });
    }
};
