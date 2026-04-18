const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/feedback/add
 * @desc    Add new feedback (Authenticated user)
 */
router.post('/add', authenticateToken, async (req, res) => {
  const { message, rating } = req.body;
  const user_id = req.user.id;

  // 🔒 Basic validation (IMPORTANT for report + real-world)
  if (!message || !rating) {
    return res.status(400).json({ message: "Message and rating are required" });
  }

  try {
    await db.query(
      "INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)",
      [user_id, message, rating]
    );

    res.json({ message: "Feedback submitted successfully" });

  } catch (err) {
    console.error("Add Feedback Error:", err);
    res.status(500).json({ message: "Server error while adding feedback" });
  }
});


/**
 * @route   GET /api/feedback/my
 * @desc    Get logged-in user's feedback
 */
router.get('/my', authenticateToken, async (req, res) => {
  const user_id = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT message, rating 
       FROM feedback 
       WHERE user_id = ? 
       ORDER BY feedback_id DESC`,
      [user_id]
    );

    res.json(rows);

  } catch (err) {
    console.error("Fetch My Feedback Error:", err);
    res.status(500).json({ message: "Server error while fetching feedback" });
  }
});


/**
 * @route   GET /api/feedback/all
 * @desc    Get all feedback (Admin dashboard)
 */
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
    console.error("Fetch All Feedback Error:", err);
    res.status(500).json({ message: "Server error while fetching all feedback" });
  }
});


/**
 * @route   DELETE /api/feedback/delete/:id
 * @desc    Delete feedback by ID
 */
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  const feedbackId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM feedback WHERE feedback_id = ?",
      [feedbackId]
    );

    // ✅ Important check (you missed this)
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });

  } catch (err) {
    console.error("Delete Feedback Error:", err);
    res.status(500).json({ message: "Server error while deleting feedback" });
  }
});

module.exports = router;