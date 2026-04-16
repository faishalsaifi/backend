const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, async (req, res) => {
  const { message, rating } = req.body;
  const user_id = req.user.id;

  try {
    await db.query(
      "INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)",
      [user_id, message, rating]
    );

    res.json({ message: "Feedback submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Get my feedback
router.get('/my', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT message, rating FROM feedback WHERE user_id = ? ORDER BY feedback_id DESC",
      [user_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/all', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        f.feedback_id,
        f.message,
        f.rating,
        u.name
      FROM feedback f
      JOIN user u ON f.user_id = u.user_id
      ORDER BY f.feedback_id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    await db.query("DELETE FROM feedback WHERE feedback_id = ?", [req.params.id]);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;