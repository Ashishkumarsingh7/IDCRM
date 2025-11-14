// backend-trust/controllers/authController.js
const { QueryTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sequelize = require('../../config/db');

// ---------------- Trust Login ----------------
const loginTrust = async (req, res) => {
  try {
    let { email, password } = req.body;

    // Trim inputs
    email = email?.trim();
    password = password?.trim();

    // ---- Validate inputs ----
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // ---- Fetch trust by email ----
    const trusts = await sequelize.query(
      `SELECT * FROM trusts WHERE email = :email`,
      { replacements: { email }, type: QueryTypes.SELECT }
    );

    const trust = trusts[0];

    if (!trust) {
      return res.status(404).json({ success: false, message: 'Trust account not found' });
    }

    if (!trust.password) {
      return res.status(400).json({ success: false, message: 'Password not set for this trust' });
    }

    // ---- Compare password ----
    const isMatch = await bcrypt.compare(password, trust.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ---- Generate JWT token including trust details ----
    const tokenPayload = {
      id: trust.id,
      trust_id: trust.id,
      trust_name: trust.trust_name,
      email: trust.email,
      role: 'trust'
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '1d' }
    );

    // ---- Response ----
    res.status(200).json({
      success: true,
      message: '✅ Trust logged in successfully',
      token,
      trust: {
        id: trust.id,
        trust_name: trust.trust_name,
        email: trust.email,
        phone: trust.phone,
        address: trust.address
      }
    });
  } catch (err) {
    console.error('Trust Login Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Trust Logout ----------------
const logoutTrust = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: '✅ Trust logged out successfully. Please clear your token from the client side.',
    });
  } catch (error) {
    console.error('Trust Logout Error:', error);
    res.status(500).json({ success: false, message: 'Server error during logout' });
  }
};

module.exports = { loginTrust, logoutTrust };
