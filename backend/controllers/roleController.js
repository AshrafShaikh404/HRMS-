const Role = require('../models/Role');
const Permission = require('../models/Permission');
const User = require('../models/User');

// @desc    Get all roles
// @route   GET /api/v1/roles
// @access  Private (Admin)
exports.getRoles = async (req, res) => {
    try {
        const roles = await Role.find()
            .populate('permissions')
            .sort({ createdAt: 1 });

        // Get user count for each role
        const rolesWithCount = await Promise.all(roles.map(async (role) => {
            const userCount = await User.countDocuments({ role: role._id });
            return {
                ...role.toObject(),
                userCount
            };
        }));

        res.status(200).json({
            success: true,
            data: rolesWithCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching roles',
            error: error.message
        });
    }
};

// @desc    Create new role
// @route   POST /api/v1/roles
// @access  Private (Admin)
exports.createRole = async (req, res) => {
    try {
        const { name, description, permissions } = req.body;

        // Check if role name already exists (case insensitive)
        const roleExists = await Role.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (roleExists) {
            return res.status(400).json({
                success: false,
                message: 'Role with this name already exists'
            });
        }

        const role = await Role.create({
            name,
            description,
            permissions
        });

        const populatedRole = await Role.findById(role._id);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: populatedRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating role',
            error: error.message
        });
    }
};

// @desc    Update role
// @route   PUT /api/v1/roles/:id
// @access  Private (Admin)
exports.updateRole = async (req, res) => {
    try {
        const { name, description, permissions, isActive } = req.body;
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        // System roles cannot change name or be deactivated
        if (role.isSystem) {
            if (name && name.toLowerCase() !== role.name.toLowerCase()) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot change name of system roles'
                });
            }
            if (isActive === false) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot deactivate system roles'
                });
            }
        }

        if (name) role.name = name;
        if (description !== undefined) role.description = description;
        if (permissions) role.permissions = permissions;
        if (typeof isActive === 'boolean') role.isActive = isActive;

        await role.save();

        const updatedRole = await Role.findById(role._id);

        res.status(200).json({
            success: true,
            message: 'Role updated successfully',
            data: updatedRole
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating role',
            error: error.message
        });
    }
};

// @desc    Get all permissions
// @route   GET /api/v1/permissions
// @access  Private (Admin)
exports.getPermissions = async (req, res) => {
    try {
        const permissions = await Permission.find().sort({ module: 1, name: 1 });

        // Group by module
        const grouped = permissions.reduce((acc, curr) => {
            if (!acc[curr.module]) {
                acc[curr.module] = [];
            }
            acc[curr.module].push(curr);
            return acc;
        }, {});

        res.status(200).json({
            success: true,
            data: permissions,
            grouped
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching permissions',
            error: error.message
        });
    }
};

// @desc    Assign role to user
// @route   POST /api/v1/roles/assign
// @access  Private (Admin)
exports.assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = await Role.findById(roleId);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Don't allow changing own role if it leads to losing admin access (basic safety)
        if (req.user._id.toString() === userId && role.name !== 'Admin' && req.user.role.name === 'Admin') {
            // Need to check if there are other admins? For now just warn or block?
            // Blocking self-demotion is safer.
            return res.status(400).json({ message: 'Cannot demote yourself from Admin' });
        }

        user.role = roleId;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.name} assigned to role ${role.name}`
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error assigning role',
            error: error.message
        });
    }
};
