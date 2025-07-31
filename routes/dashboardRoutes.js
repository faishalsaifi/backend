const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [students] = await db.query('SELECT COUNT(DISTINCT enrollment_no) AS totalStudents FROM results');
    const [subjects] = await db.query('SELECT COUNT(DISTINCT subject) AS totalSubjects FROM results');
    const [marks] = await db.query('SELECT COUNT(*) AS marksEntered FROM results WHERE marks IS NOT NULL');
    const [results] = await db.query('SELECT COUNT(DISTINCT enrollment_no) AS resultsGenerated FROM results');

    res.json({
      totalStudents: students[0].totalStudents,
      totalSubjects: subjects[0].totalSubjects,
      marksEntered: marks[0].marksEntered,
      resultsGenerated: results[0].resultsGenerated
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;