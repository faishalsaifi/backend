require('dotenv').config();
const bodyParser = require('body-parser');
const path = require('path');

const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./models/db');

// Middleware to parse form data and JSON
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const resetRoute = require('./routes/reset');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const resultRoutes = require('./routes/resultRoutes');
app.use('/api/results', resultRoutes);
app.use('/api/users', userRoutes);
app.use('/', resetRoute); // e.g., /forgot-password, /reset
app.use('/api/auth', authRoutes); // e.g., /api/auth/login, /api/auth/signup


// app.post('/api/auth/signup', (req, res) => {
//   console.log("Signup body:", req.body); // this should now show actual data
// });

// Start the server on the desired PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
