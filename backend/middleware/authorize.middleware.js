// Role-based authorization middleware
// Role-based authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please login first.'
            });
        }

        // Handle both string role (legacy) and object role (new)
        let userRole = req.user.role;
        if (typeof userRole === 'object' && userRole !== null) {
            userRole = userRole.name;
        }

        userRole = userRole?.toLowerCase();
        const allowedRoles = roles.map(role => role.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Role '${userRole}' is not authorized to access this route`
            });
        }

        next();
    };
};

// Check if user can access employee data
exports.canAccessEmployee = (req, res, next) => {
    const requestedEmployeeId = req.params.id;
    const currentUser = req.user;

    let userRole = currentUser.role;
    if (typeof userRole === 'object' && userRole !== null) {
        userRole = userRole.name;
    }
    userRole = userRole?.toLowerCase();

    // Admin and HR can access all employee data
    if (userRole === 'admin' || userRole === 'hr') {
        return next();
    }

    // Employee can only access own data
    if (userRole === 'employee') {
        // Need to check if the requested employee belongs to this user
        // This will be validated in the controller
        req.canOnlyAccessOwn = true;
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
    });
};
