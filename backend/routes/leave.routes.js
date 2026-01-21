const express = require('express');
const router = express.Router();

const {
    // Leave Types
    createLeaveType,
    getLeaveTypes,
    updateLeaveType,
    deleteLeaveType,
    // Leave Policies
    createLeavePolicy,
    getLeavePolicies,
    updateLeavePolicy,
    // Leave Applications
    getLeaveBalance,
    applyLeave,
    getPendingApprovals,
    updateLeaveStatus,
    getLeaveHistory,
    cancelLeave
} = require('../controllers/leaveController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// All routes require authentication
router.use(protect);

// Leave Types Management (Admin/HR only)
router.post('/types', authorize('admin', 'hr'), createLeaveType);
router.get('/types', getLeaveTypes);
router.put('/types/:id', authorize('admin', 'hr'), updateLeaveType);
router.delete('/types/:id', authorize('admin', 'hr'), deleteLeaveType);

// Leave Policies Management (Admin/HR only)
router.post('/policies', authorize('admin', 'hr'), createLeavePolicy);
router.get('/policies', getLeavePolicies);
router.put('/policies/:id', authorize('admin', 'hr'), updateLeavePolicy);

// Leave Balance
router.get('/balance', getLeaveBalance);

// Apply for leave
router.post('/apply', applyLeave);

// Get pending approvals (Admin/HR only)
router.get('/pending-approvals', authorize('admin', 'hr'), getPendingApprovals);

// Approve/Reject leave (Admin/HR only)
router.put('/:id/status', authorize('admin', 'hr'), updateLeaveStatus);

// Get leave history
router.get('/history', getLeaveHistory);

// Cancel leave
router.delete('/:id', cancelLeave);

module.exports = router;
