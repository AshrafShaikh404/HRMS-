const JobPosting = require('../models/JobPosting');
const Candidate = require('../models/Candidate');
const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Create job posting
// @route   POST /api/v1/recruitment/jobs
// @access  Private (Admin, HR)
exports.createJobPosting = async (req, res) => {
    try {
        const {
            title,
            description,
            department,
            salaryRange,
            skillsRequired,
            numberOfOpenings
        } = req.body;

        const job = await JobPosting.create({
            title,
            description,
            department,
            salaryRange,
            skillsRequired,
            numberOfOpenings,
            postedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Job posting created successfully',
            data: job
        });
    } catch (error) {
        console.error('Create job posting error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating job posting',
            error: error.message
        });
    }
};

// @desc    Get all job postings
// @route   GET /api/v1/recruitment/jobs
// @access  Public
exports.getJobPostings = async (req, res) => {
    try {
        const { status, department } = req.query;

        let query = {};
        if (status) query.status = status;
        if (department) query.department = department;

        const jobs = await JobPosting.find(query)
            .populate('postedBy', 'name')
            .sort({ postedDate: -1 });

        res.status(200).json({
            success: true,
            data: jobs
        });
    } catch (error) {
        console.error('Get job postings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching job postings',
            error: error.message
        });
    }
};

// @desc    Update job posting
// @route   PUT /api/v1/recruitment/jobs/:id
// @access  Private (Admin, HR)
exports.updateJobPosting = async (req, res) => {
    try {
        const job = await JobPosting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Job posting updated successfully',
            data: job
        });
    } catch (error) {
        console.error('Update job posting error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating job posting',
            error: error.message
        });
    }
};

// @desc    Submit candidate application
// @route   POST /api/v1/recruitment/apply
// @access  Public
exports.submitApplication = async (req, res) => {
    try {
        const {
            jobPostingId,
            firstName,
            lastName,
            email,
            phone,
            coverLetter,
            skills
        } = req.body;

        // Check if job exists and is open
        const job = await JobPosting.findById(jobPostingId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job posting not found'
            });
        }

        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Job posting is not accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = await Candidate.findOne({
            jobPostingId,
            email
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this position'
            });
        }

        // Create candidate
        const candidate = await Candidate.create({
            jobPostingId,
            firstName,
            lastName,
            email,
            phone,
            resume: req.file ? req.file.path : '',
            coverLetter,
            skills
        });

        res.status(201).json({
            success: true,
            message: 'Application submitted successfully',
            data: {
                applicationId: candidate._id,
                appliedAt: candidate.appliedAt
            }
        });
    } catch (error) {
        console.error('Submit application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting application',
            error: error.message
        });
    }
};

// @desc    Get all candidates
// @route   GET /api/v1/recruitment/candidates
// @access  Private (Admin, HR)
exports.getCandidates = async (req, res) => {
    try {
        const { jobPostingId, status } = req.query;

        let query = {};
        if (jobPostingId) query.jobPostingId = jobPostingId;
        if (status) query.status = status;

        const candidates = await Candidate.find(query)
            .populate('jobPostingId', 'title department')
            .sort({ appliedAt: -1 });

        res.status(200).json({
            success: true,
            data: candidates
        });
    } catch (error) {
        console.error('Get candidates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching candidates',
            error: error.message
        });
    }
};

// @desc    Update candidate status
// @route   PUT /api/v1/recruitment/candidates/:id
// @access  Private (Admin, HR)
exports.updateCandidateStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;

        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        candidate.status = status;
        if (notes) candidate.notes = notes;
        candidate.reviewedBy = req.user._id;
        candidate.reviewedAt = new Date();

        await candidate.save();

        res.status(200).json({
            success: true,
            message: 'Candidate status updated successfully',
            data: candidate
        });
    } catch (error) {
        console.error('Update candidate status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating candidate status',
            error: error.message
        });
    }
};

// @desc    Convert candidate to employee
// @route   POST /api/v1/recruitment/candidates/:id/convert
// @access  Private (Admin, HR)
exports.convertToEmployee = async (req, res) => {
    try {
        const candidate = await Candidate.findById(req.params.id);

        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidate not found'
            });
        }

        if (candidate.status !== 'selected') {
            return res.status(400).json({
                success: false,
                message: 'Only selected candidates can be converted to employees'
            });
        }

        const {
            department,
            designation,
            salary,
            joinDate
        } = req.body;

        // Generate temporary password
        const tempPassword = Math.random().toString(36).slice(-8);

        // Create user account
        const user = await User.create({
            name: `${candidate.firstName} ${candidate.lastName}`,
            email: candidate.email,
            passwordHash: tempPassword,
            role: 'employee',
            status: 'active',
            createdBy: req.user._id
        });

        // Create employee
        const employee = await Employee.create({
            userId: user._id,
            firstName: candidate.firstName,
            lastName: candidate.lastName,
            email: candidate.email,
            phone: candidate.phone,
            department: department || 'Other',
            designation,
            salary,
            joinDate: joinDate || Date.now(),
            status: 'active',
            createdBy: req.user._id
        });

        // Update candidate status
        candidate.status = 'selected';
        await candidate.save();

        res.status(201).json({
            success: true,
            message: 'Candidate converted to employee successfully',
            data: {
                employee,
                employeeCode: employee.employeeCode,
                generatedPassword: tempPassword
            }
        });
    } catch (error) {
        console.error('Convert to employee error:', error);
        res.status(500).json({
            success: false,
            message: 'Error converting candidate to employee',
            error: error.message
        });
    }
};
