const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    getEmployees,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    uploadDocument,
    verifyDocument
} = require('../controllers/employeeController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const { employeeValidation, validate } = require('../middleware/validation.middleware');

// Configure multer for file uploads
const uploadDir = './uploads/documents';

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept pdf, doc, docx, jpg, jpeg, png
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX, JPG, JPEG, PNG files are allowed'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

// All routes require authentication
router.use(protect);

// Get all employees and create new employee
router.route('/')
    .get(authorize('admin', 'hr'), getEmployees)
    .post(authorize('admin', 'hr'), employeeValidation, validate, createEmployee);


// Get, update, delete employee
router.route('/:id')
    .get(getEmployee)
    .put(updateEmployee)
    .delete(authorize('admin', 'hr'), deleteEmployee);

// Upload document
router.post('/:id/documents', upload.single('file'), uploadDocument);

// Verify document
router.put('/:id/documents/:docId/verify', authorize('admin', 'hr'), verifyDocument);

module.exports = router;
