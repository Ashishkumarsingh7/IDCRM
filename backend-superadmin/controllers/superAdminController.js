const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/superAdminModel');

// ---------------- Create Super Admin ----------------
exports.createSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    // 2️⃣ Check if Super Admin already exists
    const existing = await SuperAdmin.findOne({ where: { email } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Super Admin already exists' });
    }

    // 3️⃣ Create Super Admin (password is automatically hashed in the model)
    const newAdmin = await SuperAdmin.create({
      name,
      email,
      password, // plain password passed, model hook hashes it
    });

    console.log('Super Admin created:', email);

    // 4️⃣ Respond success
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
    console.error('Error creating Super Admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Super Admin Login ----------------
exports.loginSuperAdmin = async (req, res) => {
  try {
    console.log('--- Super Admin Login Attempt ---');
    console.log('Request body:', req.body);

    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res
        .status(400)
        .json({ success: false, message: 'Email and password are required' });
    }

    // 2️⃣ Find admin by email
    const admin = await SuperAdmin.findOne({ where: { email } });
    console.log('Admin found in DB:', admin ? admin.email : 'Not found');

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: 'Super Admin not found' });
    }

    // 3️⃣ Compare entered password with stored hash
    const isMatch = await admin.validPassword(password); // use model instance method (we can define below)
    console.log('Password entered:', password);
    console.log('Stored hash:', admin.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'superadmin' },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    console.log('Login successful, token generated');

    // 5️⃣ Respond with token
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
    });
  } catch (error) {
    console.error('Error logging in Super Admin:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
