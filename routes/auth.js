
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// ==============================
// ✅ Signup with OTP
// ==============================

// Send OTP to email
router.post('/send-otp', authController.sendOtpForSignup);

// Verify OTP and create account
router.post('/verify-otp-signup', authController.verifyOtpSignup);


// ==============================
// ✅ Login
// ==============================
router.post('/login', authController.login);


// ==============================
// 🔐 Protected Routes
// ==============================

// Get logged-in user details
router.get('/me', authenticateToken, authController.getUser);


// ==============================
// 🔑 Forgot Password Flow
// ==============================

// Send OTP for password reset
router.post('/forgot-password', authController.forgotPassword);

// Verify OTP and reset password
router.post('/reset-password', authController.verifyOtpAndReset);


module.exports = router;