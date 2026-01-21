const express = require('express');
const router = express.Router();

const {
    checkIn,
    checkOut,
    getAttendance,
    manualEntry,
    bulkAttendance,
    toggleLock,
    generateReport,
    exportAttendanceCSV,
    exportAttendancePDF
} = require('../controllers/attendanceController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// All routes require authentication
router.use(protect);

// Check in and check out
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);

// Get attendance records
router.get('/', getAttendance);

// Manual entry (Admin/HR only)
router.post('/manual-entry', authorize('admin', 'hr'), manualEntry);
router.post('/bulk', authorize('admin', 'hr'), bulkAttendance);
router.post('/lock', authorize('admin', 'hr'), toggleLock);

// Generate report (Admin/HR only)
router.get('/report', authorize('admin', 'hr'), generateReport);

// Export routes (Admin/HR only)
router.get('/export/csv', authorize('admin', 'hr'), exportAttendanceCSV);
router.get('/export/pdf', authorize('admin', 'hr'), exportAttendancePDF);

module.exports = router;
