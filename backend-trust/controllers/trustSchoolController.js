const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcryptjs'); // For password hashing

// ---------------- Trust Creates School ----------------
const createSchoolByTrust = async (req, res) => {
  try {
    const trustId = req.user.id;
    const { schoolName, schoolAdminName, email, phone, address, totalStudents, password } = req.body;

    if (!schoolName || !schoolAdminName || !password) {
      return res.status(400).json({
        success: false,
        message: 'School name, admin name, and password are required'
      });
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO schools
      (trust_id, school_name, school_admin_name, email, phone, address, total_students, password, created_at, updated_at)
      VALUES (:trust_id, :school_name, :school_admin_name, :email, :phone, :address, :total_students, :password, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = {
      trust_id: trustId,
      school_name: schoolName,
      school_admin_name: schoolAdminName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      total_students: totalStudents || 0,
      password: hashedPassword
    };

    const [result] = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

    res.status(201).json({
      success: true,
      message: '✅ School added successfully by Trust',
      data: Array.isArray(result) ? result[0] : result
    });
  } catch (err) {
    console.error('Create School by Trust Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Get All Schools under Trust ----------------
const getSchoolsByTrust = async (req, res) => {
  try {
    const trustId = req.user.id;

    const schools = await sequelize.query(
      `SELECT id, trust_id, school_name, school_admin_name, email, phone, address, total_students, created_at, updated_at 
       FROM schools WHERE trust_id = :trust_id ORDER BY id DESC`,
      { replacements: { trust_id: trustId }, type: QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      message: '✅ Schools fetched successfully',
      data: schools
    });
  } catch (err) {
    console.error('Get Schools by Trust Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createSchoolByTrust, getSchoolsByTrust };
