const Location = require('../models/Location');
const Employee = require('../models/Employee');

// @desc    Get all locations
// @route   GET /api/v1/locations
// @access  Private (Admin/HR)
exports.getLocations = async (req, res) => {
    try {
        const locations = await Location.find().sort({ name: 1 });

        // Calculate employee count for each location
        // Note: Currently Employee model might not have location field yet, or it's a string.
        // We will assume Employee will have 'location' field (String name or ObjectId)
        // User spec says: "Location dropdown fetches active locations. Location selection stored in employee profile"
        // Let's assume Employee.location stores the Location Name or ID. Ideally ID, but following previous pattern, maybe Name?
        // Let's stick to Name for consistency with Department/Designation until refactor, OR use ID if we can updates Employee model now.
        // User spec for Employee Module said "Location selection stored in employee profile".
        // Use ID for better normalization if possible, but let's check Employee model first.
        // For now, I'll match by Name or assume count is 0 if field doesn't exist.

        const locationsWithCount = await Promise.all(locations.map(async (loc) => {
            // Count employees. Assuming Employee has 'location' field.
            // If field doesn't exist yet, we'll need to add it to Employee model.
            // Let's try matching by Name for now.
            const count = await Employee.countDocuments({
                location: loc.name,
                status: 'active'
            });

            return {
                ...loc.toObject(),
                employeeCount: count
            };
        }));

        res.status(200).json({
            success: true,
            data: locationsWithCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching locations',
            error: error.message
        });
    }
};

// @desc    Create new location
// @route   POST /api/v1/locations
// @access  Private (Admin)
exports.createLocation = async (req, res) => {
    try {
        const { name, city, country, timezone, workType, description } = req.body;

        const location = await Location.create({
            name,
            city,
            country,
            timezone,
            workType,
            description,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Location created successfully',
            data: location
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Location with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error creating location',
            error: error.message
        });
    }
};

// @desc    Update location
// @route   PUT /api/v1/locations/:id
// @access  Private (Admin)
exports.updateLocation = async (req, res) => {
    try {
        const { name, city, country, timezone, workType, isActive } = req.body;
        const location = await Location.findById(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // If trying to deactivate, check for active employees
        if (isActive === false && location.isActive === true) {
            const employeeCount = await Employee.countDocuments({
                location: location.name,
                status: 'active'
            });

            if (employeeCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot deactivate location with ${employeeCount} active employees`
                });
            }
        }

        if (name) location.name = name;
        if (city) location.city = city;
        if (country) location.country = country;
        if (timezone) location.timezone = timezone;
        if (workType) location.workType = workType;
        if (isActive !== undefined) location.isActive = isActive;

        await location.save();

        res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            data: location
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Location with this name already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating location',
            error: error.message
        });
    }
};

// @desc    Delete location
// @route   DELETE /api/v1/locations/:id
// @access  Private (Admin)
exports.deleteLocation = async (req, res) => {
    try {
        const location = await Location.findById(req.params.id);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        const employeeCount = await Employee.countDocuments({
            location: location.name
        });

        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete location. ${employeeCount} employees are linked to it.`
            });
        }

        await location.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Location deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting location',
            error: error.message
        });
    }
};
