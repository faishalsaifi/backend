const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// ==============================
// ➕ Send to one user
// ==============================
router.post('/', authenticateToken, async (req, res) => {
  
  const { message, user_id } = req.body;

  if (!message || !user_id) {
    return res.status(400).json({ message: "Message and user_id are required" });
  }

  try {
    await db.query(
      "INSERT INTO notification (user_id, message) VALUES (?, ?)",
      [user_id, message]
    );

    res.json({ message: "Notification sent successfully" });

  } catch (err) {
    console.error("Send notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 📢 Send to all students
// ==============================
router.post('/send-all', authenticateToken, async (req, res) => {
  
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ message: "Message is required" });
  }

  try {
    // ✅ single query (optimized)
    await db.query(`
      INSERT INTO notification (user_id, message)
      SELECT user_id, ?
      FROM user
      WHERE role = 'Student'
    `, [message]);

    res.json({ message: "Notification sent to all students" });

  } catch (err) {
    console.error("Send all error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 👤 Get my notifications
// ==============================
router.get('/my', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT * FROM notification WHERE user_id = ? ORDER BY date_sent DESC",
      [userId]
    );

    res.json(rows);

  } catch (err) {
    console.error("Fetch my notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 👨‍💼 Admin: Get all notifications
// ==============================
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT notification.*, user.name 
      FROM notification
      JOIN user ON notification.user_id = user.user_id
      ORDER BY date_sent DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("Fetch all notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// ❌ Delete notification
// ==============================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM notification WHERE notification_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;