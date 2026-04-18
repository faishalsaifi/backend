require('dotenv').config(); // 🔐 Load environment variables from .env

const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./models/db'); // 🗄️ Database connection

// ==============================
// 🌐 GLOBAL MIDDLEWARE
// ==============================

// Enable CORS (allow frontend to communicate with backend)
app.use(cors({
  origin: '*', // ⚠️ Allow all origins (change in production for security)
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded data (form submissions)
app.use(express.urlencoded({ extended: true }));


// ==============================
// 📦 ROUTES IMPORT
// ==============================

const authRoutes = require('./routes/auth'); // 🔐 Authentication (login, signup, OTP, reset)
const userRoutes = require('./routes/userRoutes'); // 👤 User management
const resultRoutes = require('./routes/resultRoutes'); // 📊 Results CRUD
const dashboardRoutes = require('./routes/dashboardRoutes'); // 📈 Dashboard stats
const courseRoutes = require('./routes/courseRoutes'); // 📚 Courses CRUD
const notificationRoutes = require('./routes/notificationRoutes'); // 🔔 Notifications


// ==============================
// 🚀 ROUTES MIDDLEWARE
// ==============================

app.use('/api/results', resultRoutes); // Result APIs
app.use('/api/courses', courseRoutes); // Course APIs
app.use('/api/users', userRoutes); // User APIs
app.use('/api/auth', authRoutes); // Auth APIs
app.use('/api/dashboard', dashboardRoutes); // Dashboard APIs
app.use('/api/notifications', notificationRoutes); // Notification APIs

// Feedback routes (inline require)
app.use('/api/feedback', require('./routes/feedbackRoutes'));


// ==============================
// 🟢 SERVER START
// ==============================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});