const express = require('express');
const router = express.Router();

const {
    generatePayroll,
    getPayslips,
    getPayslip,
    getPayrollReports,
    approvePayroll,
    lockPayroll,
    downloadPayslip,
    exportPayrollCSV,
    exportPayrollPDF
} = require('../controllers/payrollController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { checkPermission } = require('../middleware/checkPermission');

// All routes require authentication
router.use(protect);

// Generate payroll (Admin/HR only)
router.post('/generate', authorize('admin', 'hr'), generatePayroll);

// Get all payslips for a month (Admin/HR only)
router.get('/payslips/:month/:year', authorize('admin', 'hr'), getPayslips);

// Get single payslip
router.get('/payslip/:employeeId/:month/:year', getPayslip);

// Get payroll reports (Admin/HR only)
router.get('/reports', authorize('admin', 'hr'), getPayrollReports);

// Approval Workflow
router.put('/:id/approve', protect, checkPermission('approve_payroll'), approvePayroll);
router.put('/:id/lock', protect, checkPermission('approve_payroll'), lockPayroll);

// Download
router.get('/:id/download', protect, checkPermission('view_payroll_own'), downloadPayslip);

// Export routes (Admin/HR only)
router.get('/export/csv', authorize('admin', 'hr'), exportPayrollCSV);
router.get('/export/pdf', authorize('admin', 'hr'), exportPayrollPDF);

module.exports = router;
