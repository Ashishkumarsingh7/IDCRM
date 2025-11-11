const jwt = require('jsonwebtoken');
const sequelize = require('../../config/db');
const { QueryTypes } = require('sequelize');

const verifyTrustAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if trust exists in DB
    const trust = await sequelize.query(
      `SELECT * FROM trusts WHERE id = :id`,
      { replacements: { id: decoded.id }, type: QueryTypes.SELECT }
    );

    if (!trust.length) {
      return res.status(403).json({ message: 'Invalid or unauthorized trust account' });
    }

    next();
  } catch (err) {
    console.error('Trust Auth Error:', err);
    res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = { verifyTrustAuth };
