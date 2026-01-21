const express = require('express');
const router = express.Router();
const {
    register,
    login,
    googleLogin,
    changePassword,
    getMe,
    logout,
    getUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/authorize.middleware');
const {
    loginValidation,
    registerValidation,
    changePasswordValidation,
    validate
} = require('../middleware/validation.middleware');

// Public routes
router.post('/login', loginValidation, validate, login);
router.post('/google-login', googleLogin);

// Protected routes
router.use(protect); // All routes below require authentication

router.post('/register', authorize('admin'), registerValidation, validate, register);
router.post('/change-password', changePasswordValidation, validate, changePassword);
router.get('/me', getMe);
router.get('/users', authorize('admin'), getUsers);
router.post('/logout', logout);

module.exports = router;
