const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT 
  course.course_id,
  course.course_name,
  course.course_code,
  course.duration,
  COUNT(result.enrollment_no) AS student_count
FROM course
LEFT JOIN result 
  ON course.course_id = result.course_id
GROUP BY course.course_id;`); // ✅ includes duration
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM course WHERE course_id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
router.post('/add', authenticateToken, async (req, res) => {
  const { course_name, course_code, duration } = req.body;

  await db.query(
    "INSERT INTO course (course_name, course_code, duration) VALUES (?, ?, ?)",
    [course_name, course_code, duration]
  );

  res.json({ message: "Course added" });
});

// / courseRoutes.js
router.put('/update/:id', authenticateToken, async (req, res) => {
  const { course_name, duration } = req.body;

  await db.query(
    "UPDATE course SET course_name = ?, duration = ? WHERE course_id = ?",
    [course_name, duration, req.params.id]
  );

  res.json({ message: "Updated" });
});
router.delete('/:id', authenticateToken, async (req, res) => {
  await db.query("DELETE FROM course WHERE course_id = ?", [req.params.id]);
  res.json({ message: "Deleted" });
});


module.exports = router;