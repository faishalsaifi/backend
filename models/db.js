// models/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();
// ✅ Create a pool (recommended for scalability)
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
    waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
   connectTimeout: 30000,
    enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: { rejectUnauthorized: false }

});
db.on('error', (err) => {
  console.error('MySQL Pool Error:', err);
});
module.exports = db;
