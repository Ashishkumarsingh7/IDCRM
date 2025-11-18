const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// -------------------- Teacher Login --------------------
const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔸 Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    // 🔸 Find teacher by email
    const teachers = await sequelize.query(
      `SELECT * FROM teachers WHERE email = :email`,
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    const teacher = teachers[0];
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found.'
      });
    }

    // 🔸 Compare password
    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.'
      });
    }

    // 🔸 Generate JWT token
    const token = jwt.sign(
      { id: teacher.id, name: teacher.name, role: 'teacher' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    // ✅ Login success response
    res.status(200).json({
      success: true,
      message: '✅ Teacher logged in successfully.',
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      }
    });

  } catch (error) {
    console.error('❌ Teacher Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during teacher login.'
    });
  }
};

// -------------------- Teacher Logout --------------------
const logoutTeacher = async (req, res) => {
  try {
    // ⚡ Optional: If you maintain a blacklist, add token here
    // e.g., await sequelize.query(`INSERT INTO token_blacklist (token) VALUES (:token)`, { replacements: { token: req.token } });

    res.status(200).json({
      success: true,
      message: '✅ Teacher logged out successfully. Please clear your token on client side.'
    });
  } catch (error) {
    console.error('❌ Teacher Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

module.exports = { loginTeacher, logoutTeacher };
