const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// ---------------- Add Teacher ----------------
exports.addTeacher = async (req, res) => {
  try {
    const { school_id, name, email, phone, subject, status } = req.body;

    if (!school_id || !name) {
      return res.status(400).json({ success: false, message: 'School ID and name are required' });
    }

    const query = `
      INSERT INTO teachers (school_id, name, email, phone, subject, status, created_at, updated_at)
      VALUES (:school_id, :name, :email, :phone, :subject, :status, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = {
      school_id,
      name,
      email: email || null,
      phone: phone || null,
      subject: subject || null,
      status: status || 'Active'
    };

    const [result] = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

    res.status(201).json({ success: true, message: '✅ Teacher added successfully', data: result[0] });

  } catch (error) {
    console.error('Add Teacher Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Get All Teachers for a School ----------------
exports.getTeachers = async (req, res) => {
  try {
    const { school_id } = req.params;

    if (!school_id) {
      return res.status(400).json({ success: false, message: 'School ID is required' });
    }

    const teachers = await sequelize.query(
      `SELECT * FROM teachers WHERE school_id = :school_id ORDER BY id DESC`,
      { replacements: { school_id }, type: QueryTypes.SELECT }
    );

    res.status(200).json({ success: true, data: teachers });

  } catch (error) {
    console.error('Get Teachers Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
