const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdminModel');

// ---------------- Create Super Admin ----------------
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await SuperAdmin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Super Admin already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await SuperAdmin.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: 'Super Admin created successfully',
      data: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Super Admin Login ----------------
exports.loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const admin = await SuperAdmin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
