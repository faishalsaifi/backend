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

});
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to MySQL Database ✅");
  }
});
module.exports = db;
