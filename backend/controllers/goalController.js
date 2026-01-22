const Goal = require('../models/Goal');

// @desc    Create a new goal
// @route   POST /api/v1/goals
// @access  Private (Admin/Manager/HR)
exports.createGoal = async (req, res) => {
    try {
        const {
            title,
            description,
            type,
            assignedTo,
            departmentId,
            weightage,
            startDate,
            endDate,
            targetValue,
            status
        } = req.body;

        const goal = await Goal.create({
            title,
            description,
            type,
            assignedTo, // Array of user IDs
            departmentId,
            weightage,
            startDate,
            endDate,
            targetValue,
            status: status || 'Draft',
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: goal
        });
    } catch (error) {
        console.error('Error creating goal:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all goals (optionally filtered by assignee, status, type)
// @route   GET /api/v1/goals
// @access  Private
exports.getGoals = async (req, res) => {
    try {
        const { status, type, assignedTo } = req.query;

        let query = {};

        if (status) query.status = status;
        if (type) query.type = type;

        // If query param 'assignedTo' provided, use it (for Admin filters)
        // Note: For 'My Goals', use getMyGoals
        if (assignedTo) query.assignedTo = assignedTo;

        const goals = await Goal.find(query)
            .populate('assignedTo', 'name email')
            .populate('departmentId', 'name')
            .populate('createdBy', 'name')
            .sort({ start: 1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get logged-in user's assigned goals
// @route   GET /api/v1/goals/my
// @access  Private (Employee)
exports.getMyGoals = async (req, res) => {
    try {
        const userId = req.user._id;

        const goals = await Goal.find({
            assignedTo: userId,
            status: { $ne: 'Archived' } // Don't show archived by default? Or maybe separate tab
        })
            .populate('assignedTo', 'name')
            .sort({ endDate: 1 });

        res.status(200).json({
            success: true,
            count: goals.length,
            data: goals
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update a goal
// @route   PUT /api/v1/goals/:id
// @access  Private (Admin/Manager/HR - Creator only unless Admin)
exports.updateGoal = async (req, res) => {
    try {
        let goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ success: false, message: 'Goal not found' });
        }

        // Check permission: Admin, HR, or Creator
        // Managers can edit goals they created
        if (goal.createdBy.toString() !== req.user._id.toString() && !['admin', 'hr'].includes(req.user.role?.name?.toLowerCase())) {
            // Assuming role is populated or is string
            // Safety check on permission logic based entirely on how roles are stored
            // For strict MVP, restricting to creator or admin is safe
            if (req.user.role !== 'admin' && req.user.role?.name?.toLowerCase() !== 'admin') {
                return res.status(403).json({ success: false, message: 'Not authorized to edit this goal' });
            }
        }

        goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update goal progress (Employee)
// @route   PATCH /api/v1/goals/:id/progress
// @access  Private (Employee/Manager)
exports.updateGoalProgress = async (req, res) => {
    try {
        const { progress, comment } = req.body;
        const goalId = req.params.id;
        const userId = req.user._id;

        const goal = await Goal.findById(goalId);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        // Check if user is assigned to this goal (or is creator/admin)
        const isAssigned = goal.assignedTo.some(id => id.toString() === userId.toString());
        const isCreatorOrAdmin = goal.createdBy.toString() === userId.toString() || req.user.role?.name?.toLowerCase() === 'admin';

        if (!isAssigned && !isCreatorOrAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to update progress for this goal' });
        }

        if (progress !== undefined) {
            if (progress < 0 || progress > 100) {
                return res.status(400).json({ success: false, message: 'Progress must be between 0 and 100' });
            }
            goal.progress = progress;
        }

        if (comment) {
            goal.comments.push({
                text: comment,
                author: userId
            });
        }

        // Auto-update status if 100%?
        if (goal.progress === 100 && goal.status === 'Active') {
            goal.status = 'Completed';
        }

        await goal.save();

        res.status(200).json({
            success: true,
            data: goal
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a goal
// @route   DELETE /api/v1/goals/:id
// @access  Private (Admin/HR/Creator)
exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

        // Permission check
        const isCreator = goal.createdBy.toString() === req.user._id.toString();
        const isAdminOrHR = ['admin', 'hr'].includes(req.user.role?.name?.toLowerCase());

        if (!isCreator && !isAdminOrHR) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this goal' });
        }

        await goal.deleteOne();

        res.status(200).json({ success: true, message: 'Goal removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
