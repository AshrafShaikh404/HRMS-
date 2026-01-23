const PerformanceReview = require('../models/PerformanceReview');
const ReviewCycle = require('../models/ReviewCycle');
const Goal = require('../models/Goal');
const Employee = require('../models/Employee');

// Performance Review Configuration (Keep configurable for future)
const RATING_FORMULA = {
    goalCompletionWeight: 0.6,
    managerRatingWeight: 0.3,
    hrRatingWeight: 0.1
};

// Helper function to calculate final rating based on configurable formula
const calculateFinalRating = (review) => {
    const goalCompletionAvg = review.goals.length > 0 
        ? review.goals.reduce((sum, goal) => sum + goal.finalProgress, 0) / review.goals.length 
        : 0;
    
    const managerRating = review.managerRating || 0;
    const hrRating = review.hrRating || 0;
    
    // Convert goal completion to 1-5 scale (0-100% -> 1-5)
    const goalRating = (goalCompletionAvg / 100) * 4 + 1;
    
    const finalRating = (
        goalRating * RATING_FORMULA.goalCompletionWeight +
        managerRating * RATING_FORMULA.managerRatingWeight +
        hrRating * RATING_FORMULA.hrRatingWeight
    );
    
    return Math.round(finalRating * 100) / 100; // Round to 2 decimal places
};

// @desc    Create or get performance review for employee in a cycle
// @route   POST /api/v1/performance-reviews
// @access  Private (Admin/HR/Manager)
exports.createOrGetReview = async (req, res) => {
    try {
        const { employeeId, reviewCycleId } = req.body;

        // Check if review already exists
        let review = await PerformanceReview.findOne({ employeeId, reviewCycleId })
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage');
            
        if (review) {
            return res.status(200).json({
                success: true,
                data: review,
                message: 'Existing performance review retrieved'
            });
        }

        // Validate review cycle exists and is active
        const reviewCycle = await ReviewCycle.findById(reviewCycleId);
        if (!reviewCycle) {
            return res.status(404).json({ success: false, message: 'Review cycle not found' });
        }

        if (reviewCycle.status !== 'Active') {
            return res.status(400).json({ 
                success: false, 
                message: 'Can only create reviews for active review cycles' 
            });
        }

        // Validate employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Get active goals for the employee
        const goals = await Goal.find({
            assignedTo: employee.userId,
            status: { $in: ['Active', 'Completed'] }
        }).select('_id title description weightage');

        // Create performance review with goals
        review = await PerformanceReview.create({
            employeeId,
            reviewCycleId,
            goals: goals.map(goal => ({
                goalId: goal._id,
                finalProgress: goal.progress || 0,
                selfComment: '',
                managerComment: ''
            })),
            createdBy: req.user._id
        });

        const populatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage');

        res.status(201).json({
            success: true,
            data: populatedReview,
            message: 'New performance review created'
        });
    } catch (error) {
        console.error('Error in createOrGetReview:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Create a new performance review (legacy method)
// @route   POST /api/v1/performance-reviews/create
// @access  Private (Admin/HR/Manager)
exports.createPerformanceReview = async (req, res) => {
    try {
        const { employeeId, reviewCycleId } = req.body;

        // Check if review already exists
        const existingReview = await PerformanceReview.findOne({ employeeId, reviewCycleId });
        if (existingReview) {
            return res.status(400).json({ 
                success: false, 
                message: 'Performance review already exists for this employee and cycle' 
            });
        }

        // Validate review cycle exists and is active
        const reviewCycle = await ReviewCycle.findById(reviewCycleId);
        if (!reviewCycle) {
            return res.status(404).json({ success: false, message: 'Review cycle not found' });
        }

        if (reviewCycle.status !== 'Active') {
            return res.status(400).json({ 
                success: false, 
                message: 'Can only create reviews for active review cycles' 
            });
        }

        // Validate employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        // Get active goals for the employee
        const goals = await Goal.find({
            assignedTo: employee.userId,
            status: { $in: ['Active', 'Completed'] }
        }).select('_id title description weightage');

        // Create performance review with goals
        const review = await PerformanceReview.create({
            employeeId,
            reviewCycleId,
            goals: goals.map(goal => ({
                goalId: goal._id,
                finalProgress: goal.progress || 0,
                selfComment: '',
                managerComment: ''
            })),
            createdBy: req.user._id
        });

        const populatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage');

        res.status(201).json({
            success: true,
            data: populatedReview
        });
    } catch (error) {
        console.error('Error creating performance review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get all performance reviews (filtered by role)
// @route   GET /api/v1/performance-reviews
// @access  Private
exports.getPerformanceReviews = async (req, res) => {
    try {
        const { reviewCycleId, status, employeeId } = req.query;
        let query = {};

        // Build query based on filters
        if (reviewCycleId) query.reviewCycleId = reviewCycleId;
        if (status) query.status = status;

        // Role-based filtering
        const userRole = req.user.role?.name?.toLowerCase();
        const userId = req.user._id;

        if (userRole === 'employee') {
            // Employees can only see their own reviews
            const employee = await Employee.findOne({ userId });
            if (employee) {
                query.employeeId = employee._id;
            } else {
                return res.status(404).json({ success: false, message: 'Employee record not found' });
            }
        } else if (userRole === 'manager') {
            // Managers can see reviews of their direct reports
            if (employeeId) {
                // If specific employee requested, check if they report to this manager
                const employee = await Employee.findById(employeeId);
                if (!employee || employee.jobInfo?.reportingManager?.toString() !== userId.toString()) {
                    return res.status(403).json({ success: false, message: 'Not authorized to view this review' });
                }
                query.employeeId = employeeId;
            } else {
                // Get all employees who report to this manager
                const reportingEmployees = await Employee.find({ 'jobInfo.reportingManager': userId }).select('_id');
                query.employeeId = { $in: reportingEmployees.map(emp => emp._id) };
            }
        }
        // Admin and HR can see all reviews

        const reviews = await PerformanceReview.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status startDate endDate')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error getting performance reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single performance review
// @route   GET /api/v1/performance-reviews/:id
// @access  Private
exports.getPerformanceReview = async (req, res) => {
    try {
        const review = await PerformanceReview.findById(req.params.id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status startDate endDate')
            .populate('goals.goalId', 'title description weightage progress targetValue')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName')
            .populate('createdBy', 'firstName lastName');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Permission check
        const userRole = req.user.role?.name?.toLowerCase();
        const userId = req.user._id;

        if (userRole === 'employee') {
            const employee = await Employee.findOne({ userId });
            if (!employee || employee._id.toString() !== review.employeeId._id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this review' });
            }
        } else if (userRole === 'manager') {
            const employee = await Employee.findById(review.employeeId._id);
            if (!employee || employee.jobInfo?.reportingManager?.toString() !== userId.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to view this review' });
            }
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error getting performance review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Submit self review
// @route   PATCH /api/v1/performance-reviews/self
// @access  Private (Employee)
exports.submitSelfReview = async (req, res) => {
    try {
        const { reviewId, goals, selfRating } = req.body;

        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'Review ID is required' });
        }

        const review = await PerformanceReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify this is the employee's review
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee || employee._id.toString() !== review.employeeId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
        }

        // Check if review is in correct status
        if (review.status !== 'Not Started') {
            return res.status(400).json({ 
                success: false, 
                message: 'Self review can only be submitted for reviews with status "Not Started"' 
            });
        }

        // Update goals with self comments and progress
        if (goals && Array.isArray(goals)) {
            goals.forEach(updatedGoal => {
                const goalIndex = review.goals.findIndex(g => g.goalId.toString() === updatedGoal.goalId);
                if (goalIndex !== -1) {
                    if (updatedGoal.finalProgress !== undefined) {
                        review.goals[goalIndex].finalProgress = updatedGoal.finalProgress;
                    }
                    if (updatedGoal.selfComment !== undefined) {
                        review.goals[goalIndex].selfComment = updatedGoal.selfComment;
                    }
                }
            });
        }

        // Update self rating
        if (selfRating !== undefined) {
            review.selfRating = selfRating;
        }

        // Calculate final rating (will be recalculated as ratings are added)
        review.finalRating = calculateFinalRating(review);

        // Update status
        review.status = 'Self Submitted';
        review.submittedAt = new Date();

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage');

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: 'Self review submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting self review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update performance review (self review) - Legacy method
// @route   PUT /api/v1/performance-reviews/:id/self-review-legacy
// @access  Private (Employee)
exports.updateSelfReview = async (req, res) => {
    try {
        const { goals, selfRating } = req.body;

        const review = await PerformanceReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify this is the employee's review
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee || employee._id.toString() !== review.employeeId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
        }

        // Check if review is in correct status
        if (review.status !== 'Not Started') {
            return res.status(400).json({ 
                success: false, 
                message: 'Self review can only be submitted for reviews with status "Not Started"' 
            });
        }

        // Update goals with self comments and progress
        if (goals && Array.isArray(goals)) {
            goals.forEach(updatedGoal => {
                const goalIndex = review.goals.findIndex(g => g.goalId.toString() === updatedGoal.goalId);
                if (goalIndex !== -1) {
                    if (updatedGoal.finalProgress !== undefined) {
                        review.goals[goalIndex].finalProgress = updatedGoal.finalProgress;
                    }
                    if (updatedGoal.selfComment !== undefined) {
                        review.goals[goalIndex].selfComment = updatedGoal.selfComment;
                    }
                }
            });
        }

        // Update self rating
        if (selfRating !== undefined) {
            review.selfRating = selfRating;
        }

        // Update status
        review.status = 'Self Submitted';
        review.submittedAt = new Date();

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage');

        res.status(200).json({
            success: true,
            data: updatedReview
        });
    } catch (error) {
        console.error('Error updating self review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Submit manager review
// @route   PATCH /api/v1/performance-reviews/manager
// @access  Private (Manager)
exports.submitManagerReview = async (req, res) => {
    try {
        const { reviewId, goals, managerRating } = req.body;

        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'Review ID is required' });
        }

        const review = await PerformanceReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify this manager is authorized
        const employee = await Employee.findById(review.employeeId);
        if (!employee || employee.jobInfo?.reportingManager?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this employee' });
        }

        // Check if review is in correct status
        if (review.status !== 'Self Submitted') {
            return res.status(400).json({ 
                success: false, 
                message: 'Manager review can only be done for reviews with status "Self Submitted"' 
            });
        }

        // Update goals with manager comments
        if (goals && Array.isArray(goals)) {
            goals.forEach(updatedGoal => {
                const goalIndex = review.goals.findIndex(g => g.goalId.toString() === updatedGoal.goalId);
                if (goalIndex !== -1) {
                    if (updatedGoal.managerComment !== undefined) {
                        review.goals[goalIndex].managerComment = updatedGoal.managerComment;
                    }
                }
            });
        }

        // Update manager rating
        if (managerRating !== undefined) {
            review.managerRating = managerRating;
        }

        // Calculate final rating
        review.finalRating = calculateFinalRating(review);

        // Update status and reviewer
        review.status = 'Manager Reviewed';
        review.reviewedByManager = req.user._id;

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: 'Manager review submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting manager review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update performance review (manager review) - Legacy method
// @route   PUT /api/v1/performance-reviews/:id/manager-review-legacy
// @access  Private (Manager)
exports.updateManagerReview = async (req, res) => {
    try {
        const { goals, managerRating } = req.body;

        const review = await PerformanceReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify this manager is authorized
        const employee = await Employee.findById(review.employeeId);
        if (!employee || employee.jobInfo?.reportingManager?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to review this employee' });
        }

        // Check if review is in correct status
        if (review.status !== 'Self Submitted') {
            return res.status(400).json({ 
                success: false, 
                message: 'Manager review can only be done for reviews with status "Self Submitted"' 
            });
        }

        // Update goals with manager comments
        if (goals && Array.isArray(goals)) {
            goals.forEach(updatedGoal => {
                const goalIndex = review.goals.findIndex(g => g.goalId.toString() === updatedGoal.goalId);
                if (goalIndex !== -1) {
                    if (updatedGoal.managerComment !== undefined) {
                        review.goals[goalIndex].managerComment = updatedGoal.managerComment;
                    }
                }
            });
        }

        // Update manager rating
        if (managerRating !== undefined) {
            review.managerRating = managerRating;
        }

        // Update status and reviewer
        review.status = 'Manager Reviewed';
        review.reviewedByManager = req.user._id;

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedReview
        });
    } catch (error) {
        console.error('Error updating manager review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Submit HR review
// @route   PATCH /api/v1/performance-reviews/hr
// @access  Private (HR)
exports.submitHRReview = async (req, res) => {
    try {
        const { reviewId, hrRating } = req.body;

        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'Review ID is required' });
        }

        const review = await PerformanceReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify user is HR
        const userRole = req.user.role?.name?.toLowerCase();
        if (userRole !== 'hr' && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to perform HR review' });
        }

        // Check if review is in correct status
        if (review.status !== 'Manager Reviewed') {
            return res.status(400).json({ 
                success: false, 
                message: 'HR review can only be done for reviews with status "Manager Reviewed"' 
            });
        }

        // Update HR rating
        if (hrRating !== undefined) {
            review.hrRating = hrRating;
        }

        // Calculate final rating
        review.finalRating = calculateFinalRating(review);

        // Update status and reviewer
        review.status = 'HR Reviewed';
        review.reviewedByHR = req.user._id;

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: 'HR review submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting HR review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update performance review (HR review) - Legacy method
// @route   PUT /api/v1/performance-reviews/:id/hr-review-legacy
// @access  Private (HR)
exports.updateHRReview = async (req, res) => {
    try {
        const { hrRating } = req.body;

        const review = await PerformanceReview.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Check if review is editable
        const isEditable = await review.isEditable();
        if (!isEditable) {
            return res.status(400).json({ 
                success: false, 
                message: 'Review is not editable (cycle is closed)' 
            });
        }

        // Verify user is HR
        const userRole = req.user.role?.name?.toLowerCase();
        if (userRole !== 'hr' && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to perform HR review' });
        }

        // Check if review is in correct status
        if (review.status !== 'Manager Reviewed') {
            return res.status(400).json({ 
                success: false, 
                message: 'HR review can only be done for reviews with status "Manager Reviewed"' 
            });
        }

        // Update HR rating
        if (hrRating !== undefined) {
            review.hrRating = hrRating;
        }

        // Update status and reviewer
        review.status = 'HR Reviewed';
        review.reviewedByHR = req.user._id;

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedReview
        });
    } catch (error) {
        console.error('Error updating HR review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Finalize performance review
// @route   PATCH /api/v1/performance-reviews/finalize
// @access  Private (HR/Admin)
exports.finalizeReview = async (req, res) => {
    try {
        const { reviewId } = req.body;

        if (!reviewId) {
            return res.status(400).json({ success: false, message: 'Review ID is required' });
        }

        const review = await PerformanceReview.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Performance review not found' });
        }

        // Verify user is HR or Admin
        const userRole = req.user.role?.name?.toLowerCase();
        if (userRole !== 'hr' && userRole !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to finalize review' });
        }

        // Check if review is in correct status
        if (review.status !== 'HR Reviewed') {
            return res.status(400).json({ 
                success: false, 
                message: 'Review can only be finalized when status is "HR Reviewed"' 
            });
        }

        // Finalize the review
        review.status = 'Finalized';

        await review.save();

        const updatedReview = await PerformanceReview.findById(review._id)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: updatedReview,
            message: 'Performance review finalized successfully'
        });
    } catch (error) {
        console.error('Error finalizing review:', error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Get my performance review (for current active cycle)
// @route   GET /api/v1/performance-reviews/my
// @access  Private (Employee)
exports.getMyReview = async (req, res) => {
    try {
        const employee = await Employee.findOne({ userId: req.user._id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee record not found' });
        }

        // Get active review cycle
        const activeCycle = await ReviewCycle.findOne({ status: 'Active' });
        if (!activeCycle) {
            return res.status(404).json({ success: false, message: 'No active review cycle found' });
        }

        const review = await PerformanceReview.findByEmployeeAndCycle(employee._id, activeCycle._id)
            .populate('goals.goalId', 'title description weightage progress targetValue')
            .populate('reviewCycleId', 'name status startDate endDate');

        if (!review) {
            return res.status(404).json({ success: false, message: 'No performance review found for active cycle' });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Error getting my performance review:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get team performance reviews (Manager)
// @route   GET /api/v1/performance-reviews/team
// @access  Private (Manager)
exports.getTeamReviews = async (req, res) => {
    try {
        const { reviewCycleId, status } = req.query;
        const managerId = req.user._id;

        // Get all employees who report to this manager
        const reportingEmployees = await Employee.find({ 'jobInfo.reportingManager': managerId }).select('_id');
        
        if (reportingEmployees.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                data: [],
                message: 'No team members found'
            });
        }

        let query = {
            employeeId: { $in: reportingEmployees.map(emp => emp._id) }
        };

        // Add filters if provided
        if (reviewCycleId) query.reviewCycleId = reviewCycleId;
        if (status) query.status = status;

        const reviews = await PerformanceReview.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status startDate endDate')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error getting team reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all performance reviews (Admin/HR)
// @route   GET /api/v1/performance-reviews/all
// @access  Private (Admin/HR)
exports.getAllReviews = async (req, res) => {
    try {
        const { reviewCycleId, status, employeeId, department } = req.query;
        let query = {};

        // Build query based on filters
        if (reviewCycleId) query.reviewCycleId = reviewCycleId;
        if (status) query.status = status;
        if (employeeId) query.employeeId = employeeId;

        // If department filter is provided, we need to join with Employee
        let reviews;
        if (department) {
            // Get employees in the specified department
            const departmentEmployees = await Employee.find({ 'jobInfo.department': department }).select('_id');
            query.employeeId = { $in: departmentEmployees.map(emp => emp._id) };
        }

        reviews = await PerformanceReview.find(query)
            .populate('employeeId', 'firstName lastName employeeCode')
            .populate('reviewCycleId', 'name status startDate endDate')
            .populate('goals.goalId', 'title description weightage')
            .populate('reviewedByManager', 'firstName lastName')
            .populate('reviewedByHR', 'firstName lastName')
            .populate('createdBy', 'firstName lastName')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        console.error('Error getting all reviews:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
