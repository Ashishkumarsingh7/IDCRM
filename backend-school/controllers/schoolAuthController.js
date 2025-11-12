const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ---------------- School Login ----------------
const loginSchool = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --- Validation ---
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // --- Find School by Email ---
    const schoolQuery = `
      SELECT id, school_name, email, password
      FROM schools
      WHERE email = :email
      LIMIT 1;
    `;
    const schools = await sequelize.query(schoolQuery, {
      replacements: { email },
      type: QueryTypes.SELECT
    });

    if (schools.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'School not found'
      });
    }

    const school = schools[0];

    // --- Check if Password Exists ---
    if (!school.password) {
      return res.status(400).json({
        success: false,
        message: 'Password not set for this school'
      });
    }

    // --- Compare Password ---
    const isMatch = await bcrypt.compare(password, school.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // --- Generate JWT Token ---
    const token = jwt.sign(
      { id: school.id, email: school.email },
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: school.id,
        name: school.school_name,
        email: school.email
      }
    });

  } catch (err) {
    console.error('Login School Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { loginSchool };
