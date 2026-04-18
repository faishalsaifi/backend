const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

// Middleware to verify JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // ✅ Check if header exists and starts with Bearer
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or malformed' });
  }

  // Extract token
  const token = authHeader.split(' ')[1];

  // Verify token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('❌ JWT verification failed:', err.message);

      return res.status(403).json({
        message: 'Invalid or expired token'
      });
    }

    // Attach user data to request
    req.user = decoded;

    next();
  });
};