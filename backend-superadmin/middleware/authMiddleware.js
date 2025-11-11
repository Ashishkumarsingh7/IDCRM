const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify Super Admin token
const verifySuperAdmin = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Token missing' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user info to req
    req.user = decoded; // decoded should contain id, email, role, etc.
    
    // Continue to next middleware/controller
    next();
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = { verifySuperAdmin };
