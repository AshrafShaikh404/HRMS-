const ReviewCycle = require('../models/ReviewCycle');

// @desc    Create a new Review Cycle
// @route   POST /api/v1/review-cycles
// @access  Private (Admin/HR)
exports.createReviewCycle = async (req, res) => {
    try {
        const {
            name,
            startDate,
            endDate,
            selfReviewOpen,
            managerReviewOpen,
            hrReviewOpen,
            status
        } = req.body;

        // Validation removed: multiple ACTIVE cycles allowed now

        const cycle = await ReviewCycle.create({
            name,
            startDate,
            endDate,
            status: status || 'Upcoming',
            selfReviewOpen,
            managerReviewOpen,
            hrReviewOpen,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: cycle
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all review cycles
// @route   GET /api/v1/review-cycles
// @access  Private
exports.getReviewCycles = async (req, res) => {
    try {
        const cycles = await ReviewCycle.find().sort({ startDate: -1 });
        res.status(200).json({
            success: true,
            count: cycles.length,
            data: cycles
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update Review Cycle (Status or Props)
// @route   PUT /api/v1/review-cycles/:id
// @access  Private (Admin/HR)
exports.updateReviewCycle = async (req, res) => {
    try {
        const { status } = req.body;

        // Check active constraint removed

        const cycle = await ReviewCycle.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!cycle) return res.status(404).json({ success: false, message: 'Review cycle not found' });

        res.status(200).json({
            success: true,
            data: cycle
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete (optional, usually unsafe if data exists)
// @route   DELETE /api/v1/review-cycles/:id
exports.deleteReviewCycle = async (req, res) => {
    try {
        // Can add checks if reviews depend on this cycle
        await ReviewCycle.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Review cycle deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
