const express = require('express');
const router = express.Router();

// 📂 Import result controller (contains all logic)
const resultController = require('../controllers/resultController');

// 🔐 Middleware to protect routes (JWT authentication)
const { authenticateToken } = require('../middleware/authMiddleware');


// ==============================
// ➕ Add new result
// ==============================
// Protected → only logged-in users (Admin)
router.post('/add', authenticateToken, resultController.addResult);


// ==============================
// 👤 Get logged-in user's results
// ==============================
// Uses req.user.id from token
router.get('/my-results', authenticateToken, resultController.getMyResults);


// ==============================
// 📋 Get all results (Admin view)
// ==============================
// Returns all students' results
router.get('/all', authenticateToken, resultController.getAllResults);


// ==============================
// 🔍 Get single result by ID
// ==============================
// Used for edit functionality
router.get('/:id', authenticateToken, resultController.getResultById);


// ==============================
// ✏️ Update result
// ==============================
// Updates marks, subject, course, semester etc.
router.put('/update/:id', authenticateToken, resultController.updateResult);


// ==============================
// ❌ Delete result
// ==============================
// Deletes result by result_id
router.delete('/delete/:id', authenticateToken, resultController.deleteResult);



// Export router
module.exports = router;