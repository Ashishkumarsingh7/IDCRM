const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const teachers = await sequelize.query(
      `SELECT * FROM teachers WHERE email = :email`,
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    const teacher = teachers[0];
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: teacher.id, role: 'teacher' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: '✅ Teacher logged in successfully',
      token,
      teacher: {
        id: teacher.id,
        name: teacher.name,
        email: teacher.email
      }
    });

  } catch (err) {
    console.error('Teacher Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { loginTeacher };
