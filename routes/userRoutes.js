const db = require('../models/db'); 
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// 🔐 Get all users (Admin use - protected)
router.get('/', authenticateToken, userController.getAllUsers);

// 🔍 Get user by email (used in Result page to auto-fill student name)
// Returns only name and role
router.get('/by-email/:email', authenticateToken, async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT name, role FROM user WHERE email = ?",
      [email]
    );

    // ❌ If no user found
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Send user data
    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔍 Get user by ID
router.get('/:id', authenticateToken, userController.getUserById);

// ✏️ Update user (name/email)
router.put('/:id', authenticateToken, userController.updateUser);

// ❌ Delete user
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;