const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');


// ✅ Send to one user
router.post('/add', authenticateToken, async (req, res) => {
  const { message, user_id } = req.body;

  await db.query(
    "INSERT INTO notification (user_id, message) VALUES (?, ?)",
    [user_id, message]
  );

  res.json({ message: "Notification sent" });
});


// ✅ Send to all students
router.post('/send-all', authenticateToken, async (req, res) => {
  const { message } = req.body;

  const [users] = await db.query("SELECT user_id FROM user WHERE role = 'Student'");

  for (let user of users) {
    await db.query(
      "INSERT INTO notification (user_id, message) VALUES (?, ?)",
      [user.user_id, message]
    );
  }

  res.json({ message: "Sent to all students" });
});


// ✅ Get logged-in user's notifications
router.get('/my', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  const [rows] = await db.query(
    "SELECT * FROM notification WHERE user_id = ? ORDER BY date_sent DESC",
    [userId]
  );

  res.json(rows);
});


// ✅ Admin view all
router.get('/all', authenticateToken, async (req, res) => {
  const [rows] = await db.query(`
    SELECT notification.*, user.name 
    FROM notification
    JOIN user ON notification.user_id = user.user_id
    ORDER BY date_sent DESC
  `);

  res.json(rows);
});
router.delete('/delete/:id', authenticateToken, async (req, res) => {
  await db.query("DELETE FROM notification WHERE notification_id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});
module.exports = router;