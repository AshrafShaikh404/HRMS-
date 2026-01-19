const express = require('express');
const router = express.Router();

const {
    getAdminDashboard,
    getHRDashboard,
    getEmployeeDashboard
} = require('../controllers/dashboardController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// All routes require authentication
router.use(protect);

// Role-specific dashboards
router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/hr', authorize('hr'), getHRDashboard);
router.get('/employee', authorize('employee'), getEmployeeDashboard);

module.exports = router;
