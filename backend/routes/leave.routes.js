const express = require('express');
const router = express.Router();

const {
    getLeaveBalance,
    applyLeave,
    getPendingApprovals,
    approveLeave,
    rejectLeave,
    getLeaveHistory,
    cancelLeave,
    exportLeaveCSV,
    exportLeavePDF
} = require('../controllers/leaveController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// All routes require authentication
router.use(protect);

// Get leave balance
router.get('/balance', getLeaveBalance);

// Apply for leave
router.post('/apply', applyLeave);

// Get pending approvals (Admin/HR only)
router.get('/pending-approvals', authorize('admin', 'hr'), getPendingApprovals);

// Approve/Reject leave (Admin/HR only)
router.put('/:id/approve', authorize('admin', 'hr'), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr'), rejectLeave);

// Get leave history
router.get('/history', getLeaveHistory);

// Cancel leave
router.delete('/:id', cancelLeave);

// Export routes (Admin/HR only)
router.get('/export/csv', authorize('admin', 'hr'), exportLeaveCSV);
router.get('/export/pdf', authorize('admin', 'hr'), exportLeavePDF);

module.exports = router;
