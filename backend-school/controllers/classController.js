// backend-superadmin/controllers/classController.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// -------------------- Add Class --------------------
exports.addClass = async (req, res) => {
  try {
    const { school_id, class_name, section, class_teacher, expected_students } = req.body;

    if (!school_id || !class_name || !section) {
      return res.status(400).json({
        success: false,
        message: 'School ID, class name, and section are required'
      });
    }

    const query = `
      INSERT INTO classes (school_id, class_name, section, class_teacher, expected_students, created_at, updated_at)
      VALUES (:school_id, :class_name, :section, :class_teacher, :expected_students, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = {
      school_id,
      class_name,
      section,
      class_teacher: class_teacher || null,
      expected_students: expected_students || 0
    };

    const [result] = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

    res.status(201).json({ success: true, message: '✅ Class added successfully', data: result[0] });

  } catch (error) {
    console.error('Add Class Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------- Add Division --------------------
exports.addDivision = async (req, res) => {
  try {
    const { class_id, division_name } = req.body;

    if (!class_id || !division_name) {
      return res.status(400).json({
        success: false,
        message: 'Class ID and division name are required'
      });
    }

    const query = `
      INSERT INTO divisions (class_id, division_name, created_at, updated_at)
      VALUES (:class_id, :division_name, NOW(), NOW())
      RETURNING *;
    `;

    const [result] = await sequelize.query(query, {
      replacements: { class_id, division_name },
      type: QueryTypes.INSERT
    });

    res.status(201).json({ success: true, message: '✅ Division added successfully', data: result[0] });

  } catch (error) {
    console.error('Add Division Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------- Get All Classes for a School --------------------
exports.getClasses = async (req, res) => {
  try {
    const { school_id } = req.params; // now coming from request params

    if (!school_id) {
      return res.status(400).json({ success: false, message: 'School ID is required' });
    }

    const classes = await sequelize.query(
      `SELECT * FROM classes WHERE school_id = :school_id ORDER BY id DESC`,
      { replacements: { school_id }, type: QueryTypes.SELECT }
    );

    res.status(200).json({ success: true, data: classes });

  } catch (error) {
    console.error('Get Classes Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// -------------------- Get Divisions of a Class --------------------
exports.getDivisions = async (req, res) => {
  try {
    const { class_id } = req.params;

    if (!class_id) {
      return res.status(400).json({ success: false, message: 'Class ID is required' });
    }

    const divisions = await sequelize.query(
      `SELECT * FROM divisions WHERE class_id = :class_id ORDER BY id ASC`,
      { replacements: { class_id }, type: QueryTypes.SELECT }
    );

    res.status(200).json({ success: true, data: divisions });

  } catch (error) {
    console.error('Get Divisions Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
