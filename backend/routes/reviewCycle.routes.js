const express = require('express');
const router = express.Router();
const {
    createReviewCycle,
    getReviewCycles,
    updateReviewCycle,
    deleteReviewCycle
} = require('../controllers/reviewCycleController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(protect);

router.route('/')
    .post(authorize('admin', 'hr'), createReviewCycle)
    .get(getReviewCycles);

router.route('/:id')
    .put(authorize('admin', 'hr'), updateReviewCycle)
    .delete(authorize('admin', 'hr'), deleteReviewCycle);

module.exports = router;
