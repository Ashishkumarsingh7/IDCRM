const jwt = require('jsonwebtoken');

const verifyTeacher = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.teacher = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyTeacher };
