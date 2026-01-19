const express = require('express');
const router = express.Router();

const {
    generatePayroll,
    getPayslips,
    getPayslip,
    getPayrollReports,
    updatePayrollStatus,
    exportPayrollCSV,
    exportPayrollPDF
} = require('../controllers/payrollController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

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

// Update payroll status (Admin/HR only)
router.put('/:id/status', authorize('admin', 'hr'), updatePayrollStatus);

// Export routes (Admin/HR only)
router.get('/export/csv', authorize('admin', 'hr'), exportPayrollCSV);
router.get('/export/pdf', authorize('admin', 'hr'), exportPayrollPDF);

module.exports = router;
