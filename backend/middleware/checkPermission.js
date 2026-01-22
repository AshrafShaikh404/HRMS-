const User = require('../models/User');

// Middleware to check if user has specific permission
exports.checkPermission = (requiredPermission) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ success: false, message: 'Not authorized' });
            }

            // Optimization: If req.user.role has permissions populated, use it.
            // Otherwise fetch it.

            let userPermissions = [];
            let userRole = req.user.role;

            // If role is just an ID (not populated) or permissions missing
            if (!userRole || !userRole.permissions || !Array.isArray(userRole.permissions)) {
                const userWithRole = await User.findById(req.user._id).populate('role');
                if (!userWithRole || !userWithRole.role) {
                    return res.status(403).json({ success: false, message: 'Role not assigned' });
                }
                userRole = userWithRole.role;
                // Update req.user for next middlewares in the chain
                req.user.role = userRole;
            }

            // Admin role bypass
            if (userRole.name?.toLowerCase() === 'admin') {
                return next();
            }

            const hasPermission = userRole.permissions.some(p => {
                const permName = typeof p === 'string' ? p : p.name;
                return permName === requiredPermission;
            });

            if (!hasPermission) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Requires permission: ${requiredPermission}`
                });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ success: false, message: 'Server error checking permissions' });
        }
    };
};
