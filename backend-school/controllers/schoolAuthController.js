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
        message: 'Email and password are required',
      });
    }

    // --- Find School by Email ---
    const schoolQuery = `
      SELECT id, school_name, email, password
      FROM schools
      WHERE LOWER(email) = LOWER(:email)
      LIMIT 1;
    `;
    const schools = await sequelize.query(schoolQuery, {
      replacements: { email },
      type: QueryTypes.SELECT,
    });

    if (!schools.length) {
      return res.status(404).json({
        success: false,
        message: 'School not found',
      });
    }

    const school = schools[0];

    // --- Check Password ---
    const isMatch = await bcrypt.compare(password, school.password || '');
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // --- Generate JWT Token with school_id ---
    const tokenPayload = {
      id: school.id,
      email: school.email,
      school_id: school.id, // Important for APIs
      role: 'school',
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'defaultSecretKey',
      { expiresIn: '1d' }
    );

    // --- Response ---
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: {
        id: school.id,
        name: school.school_name,
        email: school.email,
      },
    });
  } catch (err) {
    console.error('Login School Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- School Logout ----------------
const logoutSchool = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: '✅ School logged out successfully. Please clear your token from the client side.',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = { loginSchool, logoutSchool };
