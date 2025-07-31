console.log("📂 authController.js loaded");
const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;


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