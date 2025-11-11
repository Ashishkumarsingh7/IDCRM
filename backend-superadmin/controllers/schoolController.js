const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// ---------------- Add School ----------------
const createSchool = async (req, res) => {
  try {
    const {
      schoolName,
      trustId,
      schoolAdminName,
      email,
      phone,
      address,
      totalStudents
    } = req.body;

    if (!schoolName || !trustId || !schoolAdminName) {
      return res.status(400).json({
        success: false,
        message: 'School name, trust ID, and school admin name are required'
      });
    }

    const query = `
      INSERT INTO schools
      (trust_id, school_name, school_admin_name, email, phone, address, total_students, created_at, updated_at)
      VALUES (:trust_id, :school_name, :school_admin_name, :email, :phone, :address, :total_students, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = {
      trust_id: trustId,
      school_name: schoolName,
      school_admin_name: schoolAdminName,
      email: email || null,
      phone: phone || null,
      address: address || null,
      total_students: totalStudents || 0
    };

    const [result] = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

    res.status(201).json({
      success: true,
      message: '✅ School added successfully',
      data: Array.isArray(result) ? result[0] : result
    });

  } catch (err) {
    console.error('Create School Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Update School ----------------
const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      schoolName,
      trustId,
      schoolAdminName,
      email,
      phone,
      address,
      totalStudents
    } = req.body;

    // Check if school exists
    const existingSchool = await sequelize.query(
      `SELECT * FROM schools WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!existingSchool.length) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const query = `
      UPDATE schools
      SET
        school_name = COALESCE(:school_name, school_name),
        trust_id = COALESCE(:trust_id, trust_id),
        school_admin_name = COALESCE(:school_admin_name, school_admin_name),
        email = COALESCE(:email, email),
        phone = COALESCE(:phone, phone),
        address = COALESCE(:address, address),
        total_students = COALESCE(:total_students, total_students),
        updated_at = NOW()
      WHERE id = :id
      RETURNING *;
    `;

    const replacements = {
      id,
      school_name: schoolName,
      trust_id: trustId,
      school_admin_name: schoolAdminName,
      email,
      phone,
      address,
      total_students: totalStudents
    };

    const [updatedResult] = await sequelize.query(query, { replacements, type: QueryTypes.UPDATE });
    const updatedSchool = Array.isArray(updatedResult) ? updatedResult[0] : updatedResult;

    res.status(200).json({
      success: true,
      message: 'School updated successfully',
      data: updatedSchool
    });

  } catch (err) {
    console.error('Update School Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Get All Schools ----------------
const getAllSchools = async (req, res) => {
  try {
    const schools = await sequelize.query(
      `SELECT s.*, t.trust_name 
       FROM schools s
       JOIN trusts t ON s.trust_id = t.id
       ORDER BY s.id DESC;`,
      { type: QueryTypes.SELECT }
    );

    res.status(200).json({ success: true, data: schools });

  } catch (err) {
    console.error('Get All Schools Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createSchool, updateSchool, getAllSchools };
