const Department = require('../models/Department');
const Employee = require('../models/Employee');

// @desc    Get all departments
// @route   GET /api/v1/departments
// @access  Private (Admin/HR)
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });

        // Get employee count for each department
        // Note: Currently Employee model stores department as String (name).
        // If we migrate to ObjectId later, this query will need to change.
        const departmentsWithCount = await Promise.all(departments.map(async (dept) => {
            const count = await Employee.countDocuments({
                department: dept.name, // Matching by name for now as per current schema
                status: 'active'
            });
            return {
                ...dept.toObject(),
                employeeCount: count
            };
        }));

        res.status(200).json({
            success: true,
            data: departmentsWithCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching departments',
            error: error.message
        });
    }
};

// @desc    Create new department
// @route   POST /api/v1/departments
// @access  Private (Admin)
exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        const department = await Department.create({
            name,
            code,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name or code already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating department',
            error: error.message
        });
    }
};

// @desc    Update department
// @route   PUT /api/v1/departments/:id
// @access  Private (Admin)
exports.updateDepartment = async (req, res) => {
    try {
        const { name, code, description, isActive } = req.body;
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        // Check if trying to deactivate a department with active employees
        if (isActive === false && department.isActive === true) {
            const employeeCount = await Employee.countDocuments({
                department: department.name,
                status: 'active'
            });

            if (employeeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot deactivate department with ${employeeCount} active employees`
                });
            }
        }

        if (name) department.name = name;
        if (code) department.code = code;
        if (description !== undefined) department.description = description;
        if (isActive !== undefined) department.isActive = isActive;

        await department.save();

        res.status(200).json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name or code already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating department',
            error: error.message
        });
    }
};

// @desc    Delete department (Soft delete preferred via update, but if no employees, hard delete allowed?)
//          User spec says: "Cannot delete department if employees exist"
//          "Actions (Edit, Disable)" - implies no hard delete button in UI usually, but API might allow it.
//          Let's implement delete but with checks.
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }

        const employeeCount = await Employee.countDocuments({
            department: department.name
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete department. ${employeeCount} employees are linked to it.`
            });
        }

        await department.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting department',
            error: error.message
        });
    }
};
