const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');


// ==============================
// ✅ Get all courses
// ==============================
router.get('/', async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        course.course_id,
        course.course_name,
        course.course_code,
        course.duration,
        COUNT(result.enrollment_no) AS student_count
      FROM course
      LEFT JOIN result 
        ON course.course_id = result.course_id
      GROUP BY course.course_id;
    `);

    res.json(rows);
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// ✅ Get course by ID
// ==============================
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
    console.error("Fetch course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// ➕ Add course
// ==============================
router.post('/', authenticateToken, async (req, res) => {
  const { course_name, course_code, duration } = req.body;

  // ✅ validation
  if (!course_name || !course_code || !duration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // ✅ check duplicate
    const [existing] = await db.query(
      "SELECT * FROM course WHERE course_code = ?",
      [course_code]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Course already exists" });
    }

    await db.query(
      "INSERT INTO course (course_name, course_code, duration) VALUES (?, ?, ?)",
      [course_name, course_code, duration]
    );

    res.json({ message: "Course added successfully" });

  } catch (err) {
    console.error("Add course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// ✏️ Update course
// ==============================
router.put('/:id', authenticateToken, async (req, res) => {
  const { course_name, duration } = req.body;

  if (!course_name || !duration) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const [result] = await db.query(
      "UPDATE course SET course_name = ?, duration = ? WHERE course_id = ?",
      [course_name, duration, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course updated successfully" });

  } catch (err) {
    console.error("Update course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// ==============================
// ❌ Delete course
// ==============================
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM course WHERE course_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });

  } catch (err) {
    console.error("Delete course error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;