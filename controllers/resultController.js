const db = require('../models/db');

// 🎯 Utility: Calculate grade based on marks
function calculateGrade(marks) {
  if (marks >= 75) return "A";
  if (marks >= 50) return "B";
  if (marks >= 40) return "C";
  return "F";
}


// ================== ADD RESULT ==================
exports.addResult = async (req, res) => {
  const { email, enrollment_no, course_id, subject, marks, semester } = req.body;

  // 🛑 Basic validation
  if (!email || !enrollment_no || !course_id || !subject || marks == null) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 🔍 Check if student exists
    const [userRows] = await db.query(
      "SELECT user_id, name FROM user WHERE email = ?",
      [email]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ message: "Invalid Email (Student not registered)" });
    }

    // 🔍 Prevent student from being in multiple courses
    const [existing] = await db.query(
      "SELECT DISTINCT course_id FROM result WHERE enrollment_no = ?",
      [enrollment_no]
    );

    if (existing.length > 0 && existing[0].course_id != course_id) {
      return res.status(400).json({
        message: "Student already assigned to another course"
      });
    }

    const user = userRows[0];

    // 🔢 Ensure marks is a number
    const numericMarks = Number(marks);
    const finalGrade = calculateGrade(numericMarks);

    // 💾 Insert result
    await db.query(
      `INSERT INTO result 
      (user_id, enrollment_no, course_id, subject, marks, grade, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.user_id, enrollment_no, course_id, subject, numericMarks, finalGrade, semester]
    );

    res.json({
      message: "Result added successfully",
      studentName: user.name
    });

  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        message: "Result already exists for this subject"
      });
    }

    console.error("❌ Add Result Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================== GET ALL RESULTS ==================
exports.getAllResults = async (req, res) => {
  try {
    const [result] = await db.query(`
      SELECT 
        result.result_id,
        result.enrollment_no,
        result.subject,
        result.marks,
        result.grade,
        user.name
      FROM result
      JOIN user ON result.user_id = user.user_id
    `);

    res.json(result);

  } catch (err) {
    console.error('❌ Error fetching results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};


// ================== GET RESULT BY ID ==================
exports.getResultById = async (req, res) => {
  const resultId = req.params.id;

  try {
    const [rows] = await db.query(`
      SELECT result.*, user.email 
      FROM result
      JOIN user ON result.user_id = user.user_id
      WHERE result_id = ?
    `, [resultId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error('❌ Error fetching result by ID:', err);
    res.status(500).json({ message: 'Error retrieving result' });
  }
};


// ================== GET RESULT BY ENROLLMENT ==================
exports.getResultByEnroll = async (req, res) => {
  const { enrollNo } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT * FROM result WHERE enrollment_no = ?',
      [enrollNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No result found' });
    }

    res.json(rows);

  } catch (error) {
    console.error("❌ Get Result Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ================== GET MY RESULTS ==================
exports.getMyResults = async (req, res) => {
  try {
    const userId = req.user.id;

    const [result] = await db.query(
      'SELECT * FROM result WHERE user_id = ?',
      [userId]
    );

    res.json(result);

  } catch (err) {
    console.error("❌ Error fetching my results:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================== UPDATE RESULT ==================
exports.updateResult = async (req, res) => {
  const resultId = req.params.id;
  const { marks, subject, course_id, semester, enrollment_no } = req.body;

  if (!marks || !subject || !course_id) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    // 🔍 Prevent course conflict
    const [existing] = await db.query(
      "SELECT DISTINCT course_id FROM result WHERE enrollment_no = ? AND result_id != ?",
      [enrollment_no, resultId]
    );

    if (existing.length > 0 && existing[0].course_id != course_id) {
      return res.status(400).json({
        message: "Student already assigned to another course"
      });
    }

    // 🔄 Recalculate grade
    const finalGrade = calculateGrade(Number(marks));

    const [result] = await db.query(
      `UPDATE result 
       SET marks = ?, grade = ?, subject = ?, course_id = ?, semester = ?
       WHERE result_id = ?`,
      [marks, finalGrade, subject, course_id, semester, resultId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result updated successfully" });

  } catch (error) {
    console.error("❌ Update error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};


// ================== DELETE RESULT ==================
exports.deleteResult = async (req, res) => {
  const resultId = req.params.id;

  try {
    const [result] = await db.query(
      "DELETE FROM result WHERE result_id = ?",
      [resultId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result deleted successfully" });

  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ message: "Failed to delete result" });
  }
};


// ================== DASHBOARD STATS ==================
exports.getDashboardStats = async (req, res) => {
  try {
    const [students] = await db.query(
      'SELECT COUNT(DISTINCT enrollment_no) AS totalStudents FROM result'
    );

    const [subjects] = await db.query(
      'SELECT COUNT(DISTINCT subject) AS totalSubjects FROM result'
    );

    const [marks] = await db.query(
      'SELECT COUNT(*) AS marksEntered FROM result'
    );

    const [result] = await db.query(
      'SELECT COUNT(DISTINCT enrollment_no) AS resultsGenerated FROM result'
    );

    res.json({
      totalStudents: students[0].totalStudents,
      totalSubjects: subjects[0].totalSubjects,
      marksEntered: marks[0].marksEntered,
      resultsGenerated: result[0].resultsGenerated
    });

  } catch (err) {
    console.error("❌ Dashboard stats error:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};