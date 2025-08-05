const db = require('../models/db');

exports.addResult = async (req, res) => {
  const {
    student_name, enrollment_no, email, gender,
    course, semester, subject, marks, status
  } = req.body;

  try {
    await db.query(
      'INSERT INTO results (student_name, enrollment_no, email, gender, course, semester, subject, marks, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [student_name, enrollment_no, email, gender, course, semester, subject, marks, status]
    );
    res.status(201).json({ message: 'Result added successfully' });
  } catch (err) {
    console.error('Add Result Error:', err);
    res.status(500).json({ message: 'Error adding result' });
  }
};
exports.getAllResults = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM results');
    res.json(results);
  } catch (err) {
    console.error('Error fetching results:', err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};
exports.getResultById = async (req, res) => {
  const resultId = req.params.id;

  try {
    const [rows] = await db.query('SELECT * FROM results WHERE id = ?', [resultId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching result by ID:', err);
    res.status(500).json({ message: 'Error retrieving result' });
  }
};
exports.getResultByEnroll = async (req, res) => {
  const { enrollNo } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM results WHERE enrollment_no = ?', [enrollNo]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No result found' });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Get Result Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/resultController.js
exports.updateResult = async (req, res) => {
  const resultId = req.params.id;
  const { marks, status } = req.body;

  try {
    const [result] = await db.query('UPDATE results SET marks = ?, status = ? WHERE id = ?', [marks, status, resultId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};

exports.deleteResult = async (req, res) => {
  const resultId = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM results WHERE id = ?", [resultId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Failed to delete result" });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [students] = await db.query('SELECT COUNT(DISTINCT enrollment_no) AS totalStudents FROM results');
    const [subjects] = await db.query('SELECT COUNT(DISTINCT subject) AS totalSubjects FROM results');
    const [marks] = await db.query('SELECT COUNT(*) AS marksEntered FROM results');
    const [results] = await db.query('SELECT COUNT(DISTINCT enrollment_no) AS resultsGenerated FROM results');

    res.json({
      totalStudents: students[0].totalStudents,
      totalSubjects: subjects[0].totalSubjects,
      marksEntered: marks[0].marksEntered,
      resultsGenerated: results[0].resultsGenerated
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};


