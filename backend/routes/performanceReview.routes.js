const express = require('express');
const router = express.Router();
const {
    createOrGetReview,
    getPerformanceReviews,
    getPerformanceReview,
    submitSelfReview,
    submitManagerReview,
    submitHRReview,
    finalizeReview,
    getMyReview,
    getTeamReviews,
    getAllReviews
} = require('../controllers/performanceReviewController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(protect);

// Initialize performance review for employee in active cycle
router.post('/init', authorize('admin', 'hr', 'manager'), createOrGetReview);

// My Performance Review (Employee)
router.get('/my', getMyReview);

// Team Reviews (Manager)
router.get('/team', authorize('admin', 'hr', 'manager'), getTeamReviews);

// All Reviews (HR/Admin)
router.get('/all', authorize('admin', 'hr'), getAllReviews);

// Review workflow routes
router.patch('/self', submitSelfReview);
router.patch('/manager', authorize('admin', 'hr', 'manager'), submitManagerReview);
router.patch('/hr', authorize('admin', 'hr'), submitHRReview);
router.patch('/finalize', authorize('admin', 'hr'), finalizeReview);

// Legacy routes for backward compatibility (keep existing frontend working)
router.get('/', getPerformanceReviews);
router.get('/:id', getPerformanceReview);

module.exports = router;
