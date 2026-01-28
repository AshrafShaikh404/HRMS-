const express = require('express');
const router = express.Router();
const {
    createAppraisalCycle,
    getEligibleEmployees,
    proposeIncrement,
    approveAppraisal,
    rejectAppraisal,
    getMyAppraisalHistory,
    getAllAppraisals,
    getAppraisalCycles,
    updateAppraisalCycle,
    deleteAppraisalCycle
} = require('../controllers/appraisalController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

router.use(protect);

// Admin/HR Routes
router.post('/cycles', authorize('admin', 'hr'), createAppraisalCycle);
router.get('/cycles', authorize('admin', 'hr'), getAppraisalCycles);
router.put('/cycles/:id', authorize('admin', 'hr'), updateAppraisalCycle);
router.delete('/cycles/:id', authorize('admin', 'hr'), deleteAppraisalCycle);
router.get('/cycles/:id/eligible-employees', authorize('admin', 'hr'), getEligibleEmployees);
router.post('/propose', authorize('admin', 'hr'), proposeIncrement);
router.patch('/:id/approve', authorize('admin', 'hr'), approveAppraisal);
router.patch('/:id/reject', authorize('admin', 'hr'), rejectAppraisal);
router.get('/', authorize('admin', 'hr'), getAllAppraisals);

// Employee Routes
router.get('/my-history', getMyAppraisalHistory);

module.exports = router;
