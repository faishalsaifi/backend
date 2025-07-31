console.log("📂 authController.js loaded");
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;
const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.signup = async (req, res) => {
  try {
    console.log("🔥 Incoming signup request with body:", req.body);

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    console.log("🔐 Password hashed");

    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log("⚠️ Email already exists");
      return res.status(400).json({ message: 'Email already registered' });
    }

    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashed]
    );

    console.log("✅ User inserted:", result);

    // 🔑 Generate token
    const token = jwt.sign({ id: result.insertId }, secretKey);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.insertId,
        name,
        email
      }
    });

  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};


// Login handler

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
     console.log('DB results:', users);
    const user = users[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id },secretKey);
    res.json({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email
  }
});

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get user
exports.getUser = async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await db.query('SELECT id, name, email FROM users WHERE id = ?', [userId]);
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


// Store OTPs temporarily in memory
const otpStore = new Map();

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("📧 Forgot password request for:", email);

    // 🔍 Check if email exists
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email not found. Please sign up first.' });
    }

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🚀 Setup transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Password Reset',
      html: `<h2>Your OTP: ${otp}</h2><p>This OTP is valid for 10 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent to:", email);

    // Optionally save OTP in DB or in-memory (like Redis) with expiry

    res.status(200).json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
// Verify OTP and reset password
exports.verifyOtpAndReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword)
    return res.status(400).json({ message: "All fields are required" });

  if (otpStore.get(email) !== otp)
    return res.status(400).json({ message: "Invalid or expired OTP" });

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE email = ?", [hashed, email]);
    otpStore.delete(email);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
