console.log("📂 authController.js loaded");

const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

const secretKey = process.env.JWT_SECRET;

// Store signup OTP temporarily (email -> { otp, name, role })
const signupOtpStore = new Map();

// Store forgot password OTP
const otpStore = new Map();


// ================== SEND OTP FOR SIGNUP ==================
exports.sendOtpForSignup = async (req, res) => {
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: "Name and Email are required" });
  }

  try {
    // 🔍 Check if email already exists
    const [existing] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 🔢 Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory
    signupOtpStore.set(email, { otp, name, role });

    // 📧 Send OTP via email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Signup',
      html: `<h2>Your Signup OTP: ${otp}</h2><p>This OTP is valid for 10 minutes.</p>`
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("❌ Error sending signup OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// ================== VERIFY OTP + SIGNUP ==================
exports.verifyOtpSignup = async (req, res) => {
  const { email, password, otp, role, passkey } = req.body;

  if (!email || !password || !otp) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const stored = signupOtpStore.get(email);

  // ❌ Invalid OTP
  if (!stored || stored.otp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const { name, role: storedRole } = stored;

  // 🔐 Admin passkey (move to env for better security)
  const ADMIN_PASSKEY = process.env.ADMIN_PASSKEY || "admin123";

  const finalRole = role || storedRole || "Student";

  // 🔒 Check admin passkey
  if (finalRole === "Admin") {
    if (!passkey || passkey !== ADMIN_PASSKEY) {
      return res.status(403).json({ message: "Invalid admin passkey" });
    }
  }

  try {
    // 🔑 Hash password
    const hashed = await bcrypt.hash(password, 10);

    // 💾 Insert user into DB
    const [result] = await db.query(
      "INSERT INTO user (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashed, finalRole]
    );

    // 🎟 Generate JWT token
    const token = jwt.sign({ id: result.insertId }, secretKey);

    // 🧹 Clear OTP after use
    signupOtpStore.delete(email);

    res.json({
      message: "Signup successful",
      token,
      user: {
        id: result.insertId,
        name,
        email,
        role: finalRole
      }
    });

  } catch (err) {
    console.error("❌ Signup verification failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================== LOGIN ==================
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const [users] = await db.query('SELECT * FROM user WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 🎟 Generate token
    const token = jwt.sign({ id: user.user_id }, secretKey);

    res.json({
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};


// ================== GET USER ==================
exports.getUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const [users] = await db.query(
      'SELECT user_id, name, email, role FROM user WHERE user_id = ?',
      [userId]
    );

    res.json(users[0]);

  } catch (err) {
    console.error("❌ Fetch user error:", err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};


// ================== FORGOT PASSWORD ==================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const [rows] = await db.query('SELECT * FROM user WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // 🔢 Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(email, otp);

    // ⏳ Expire OTP after 10 mins
    setTimeout(() => otpStore.delete(email), 10 * 60 * 1000);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OTP for Password Reset',
      html: `<h2>Your OTP: ${otp}</h2><p>This OTP is valid for 10 minutes.</p>`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ Forgot Password Error:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


// ================== VERIFY OTP + RESET PASSWORD ==================
exports.verifyOtpAndReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (otpStore.get(email) !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE user SET password = ? WHERE email = ?", [hashed, email]);

    otpStore.delete(email);

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.error("❌ Reset password error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};