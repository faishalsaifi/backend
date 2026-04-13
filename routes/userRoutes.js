const db = require('../models/db');
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Protect all user routes
router.get('/', authenticateToken, userController.getAllUsers);

router.get('/by-email/:email', authenticateToken, async (req, res) => {
  const { email } = req.params;

  try {
    const [rows] = await db.query(
      "SELECT name, role FROM user WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/:id', authenticateToken, userController.getUserById);
router.put('/:id', authenticateToken, userController.updateUser);
router.delete('/:id', authenticateToken, userController.deleteUser);

module.exports = router;
