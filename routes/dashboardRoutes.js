const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authenticateToken } = require('../middleware/authMiddleware');

// ==============================
// 📊 Get dashboard stats
// ==============================
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // ✅ Single optimized query
    const [rows] = await db.query(`
      SELECT 
        COUNT(DISTINCT enrollment_no) AS totalStudents,
        COUNT(DISTINCT subject) AS totalSubjects,
        COUNT(marks) AS marksEntered,
        COUNT(DISTINCT enrollment_no) AS resultsGenerated
      FROM result
    `);

    const stats = rows[0];

    res.json({
      totalStudents: stats.totalStudents || 0,
      totalSubjects: stats.totalSubjects || 0,
      marksEntered: stats.marksEntered || 0,
      resultsGenerated: stats.resultsGenerated || 0
    });

  } catch (err) {
    console.error('❌ Dashboard stats error:', err.message);

    res.status(500).json({
      message: 'Failed to fetch dashboard stats'
    });
  }
});

module.exports = router;