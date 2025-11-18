const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyTeacher = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');

    if (decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // ✅ Attach full info including name
    req.user = {
      id: decoded.id,
      name: decoded.name, // make sure your login route signs JWT with name
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyTeacher };
