const express = require('express');

const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/add', authenticateToken, resultController.addResult);
router.get('/all', authenticateToken, resultController.getAllResults);
router.get('/by-enroll/:enrollNo', authenticateToken, resultController.getResultByEnroll); // 👈 safer route
router.get('/:id', authenticateToken, resultController.getResultById);
router.put('/update/:id', authenticateToken, resultController.updateResult);

router.get('/public/:enrollNo', resultController.getResultByEnroll);


module.exports = router;
