const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// ---------------- Add Student ----------------
exports.addStudent = async (req, res) => {
  try {
    const { school_id, class_id, division_id, name, roll_number } = req.body;

    if (!school_id || !class_id || !division_id || !name) {
      return res.status(400).json({
        success: false,
        message: 'School, Class, Division, and Name are required'
      });
    }

    const query = `
      INSERT INTO students (school_id, class_id, division_id, name, roll_number, created_at, updated_at)
      VALUES (:school_id, :class_id, :division_id, :name, :roll_number, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = { school_id, class_id, division_id, name, roll_number: roll_number || null };

    const [result] = await sequelize.query(query, { replacements, type: QueryTypes.INSERT });

    res.status(201).json({ success: true, message: 'Student added successfully', data: result[0] });

  } catch (error) {
    console.error('Add Student Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Get All Students for a School ----------------
exports.getStudents = async (req, res) => {
  try {
    const { school_id } = req.params;

    const students = await sequelize.query(
      `SELECT s.*, c.class_name, d.division_name
       FROM students s
       JOIN classes c ON s.class_id = c.id
       JOIN divisions d ON s.division_id = d.id
       WHERE s.school_id = :school_id
       ORDER BY s.id ASC;`,
      { replacements: { school_id }, type: QueryTypes.SELECT }
    );

    res.status(200).json({ success: true, data: students });

  } catch (error) {
    console.error('Get Students Error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
