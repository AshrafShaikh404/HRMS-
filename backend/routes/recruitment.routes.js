const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
    createJobPosting,
    getJobPostings,
    updateJobPosting,
    submitApplication,
    getCandidates,
    updateCandidateStatus,
    convertToEmployee
} = require('../controllers/recruitmentController');

const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');

// Configure multer for resume uploads
const uploadDir = './uploads/resumes';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only PDF, DOC, DOCX files are allowed for resumes'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// Public routes
router.get('/jobs', getJobPostings);
router.post('/apply', upload.single('resume'), submitApplication);

// Protected routes
router.use(protect);
router.use(authorize('admin', 'hr'));

// Job posting management
router.post('/jobs', createJobPosting);
router.put('/jobs/:id', updateJobPosting);

// Candidate management
router.get('/candidates', getCandidates);
router.put('/candidates/:id', updateCandidateStatus);
router.post('/candidates/:id/convert', convertToEmployee);

module.exports = router;
