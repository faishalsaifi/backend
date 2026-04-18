
// Import mysql2 with promise support (so we can use async/await)
const mysql = require('mysql2/promise');

// Load environment variables from .env file
require('dotenv').config();

// ✅ Create a connection pool (better than single connection)
// Pool allows multiple queries at same time → improves performance & avoids crashes
const db = mysql.createPool({
  host: process.env.DB_HOST,         // Database host (e.g., localhost or hostinger DB URL)
  user: process.env.DB_USER,         // MySQL username
  password: process.env.DB_PASSWORD, // MySQL password
  database: process.env.DB_NAME,     // Database name
  port: process.env.DB_PORT,         // DB port (usually 3306)

  // 🔧 Pool configuration
  waitForConnections: true,  // Wait if all connections are busy instead of failing
  connectionLimit: 10,       // Max number of connections in pool
  queueLimit: 0,             // Unlimited queue (0 = no limit)

  // ⏱️ Timeout settings
  connectTimeout: 30000,     // 30 seconds timeout for connection

  // 🔄 Keep connection alive (important for Render / cloud DB)
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  // 🔐 SSL (required for cloud DB like hostinger / Render sometimes)
  ssl: { rejectUnauthorized: false }
});

// ❌ Handle unexpected MySQL pool errors
db.on('error', (err) => {
  console.error('MySQL Pool Error:', err);
});

// Export pool so it can be used in controllers/routes
module.exports = db;