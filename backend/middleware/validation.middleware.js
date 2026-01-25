const { body, validationResult } = require('express-validator');

// Validation middleware to check for errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Login validation rules
exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Register validation rules
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn(['admin', 'hr', 'employee'])
    .withMessage('Invalid role')
];

// Change password validation
exports.changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
];

// Employee validation rules
exports.employeeValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required'),

  body('email')
    .isEmail().withMessage('Valid email is required'),

  body('phone')
    .notEmpty().withMessage('Phone number is required'),

  body('jobInfo.department')
    .notEmpty()
    .withMessage('Department is required'),

  body('jobInfo.designation')
    .notEmpty().withMessage('Designation is required'),

  body('salary')
    .isNumeric().withMessage('Salary must be a number'),
];