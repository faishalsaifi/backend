// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');
const db = require('../models/db'); // adjust if db.js is in another location

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.email}, this is a protected route!` });
});

router.get('/me', authenticateToken, authController.getUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtpAndReset);

module.exports = router;
