const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// -------------------- Add Class --------------------
exports.addClass = async (req, res) => {
  try {
    const school_id = req.user?.school_id;
    const { class_name, section } = req.body;

    if (!school_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: School information not found.' });
    }
    if (!class_name || !section) {
      return res.status(400).json({ success: false, message: 'Class Name and Section are required.' });
    }

    const trimmedClassName = class_name.trim();
    const trimmedSection = section.trim();

    const existingClass = await sequelize.query(
      `SELECT id FROM classes WHERE school_id = :school_id AND LOWER(class_name) = LOWER(:class_name)`,
      { replacements: { school_id, class_name: trimmedClassName }, type: QueryTypes.SELECT }
    );

    if (existingClass.length > 0) {
      return res.status(409).json({ success: false, message: `Class '${trimmedClassName}' already exists.` });
    }

    const query = `
      INSERT INTO classes (school_id, class_name, section, created_at, updated_at)
      VALUES (:school_id, :class_name, :section, NOW(), NOW())
      RETURNING *;
    `;
    const [insertedClass] = await sequelize.query(query, {
      replacements: { school_id, class_name: trimmedClassName, section: trimmedSection },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ success: true, message: '✅ Class added successfully', data: insertedClass[0] });
  } catch (error) {
    console.error('❌ Add Class Error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding class' });
  }
};

// -------------------- Add Division --------------------
exports.addDivision = async (req, res) => {
  try {
    const school_id = req.user?.school_id;
    let { class_name, division_name, class_teacher, expected_students } = req.body;

    if (!school_id) {
      return res.status(401).json({ success: false, message: 'Unauthorized: School information not found.' });
    }
    if (!class_name || !division_name) {
      return res.status(400).json({ success: false, message: 'Class Name and Division Name are required.' });
    }

    class_name = class_name.trim();
    division_name = division_name.trim();
    class_teacher = class_teacher?.trim() || null;
    expected_students = Number(expected_students) || 0;

    // Check if division already exists for this class_name
    const existingDivision = await sequelize.query(
      `SELECT id FROM divisions WHERE LOWER(class_name) = LOWER(:class_name) AND LOWER(division_name) = LOWER(:division_name)`,
      { replacements: { class_name, division_name }, type: QueryTypes.SELECT }
    );

    if (existingDivision.length > 0) {
      return res.status(409).json({ success: false, message: `Division '${division_name}' already exists for class '${class_name}'.` });
    }

    const query = `
      INSERT INTO divisions (class_name, division_name, class_teacher, expected_students, created_at, updated_at)
      VALUES (:class_name, :division_name, :class_teacher, :expected_students, NOW(), NOW())
      RETURNING *;
    `;
    const [insertedDivision] = await sequelize.query(query, {
      replacements: { class_name, division_name, class_teacher, expected_students },
      type: QueryTypes.INSERT,
    });

    res.status(201).json({ success: true, message: '✅ Division added successfully', data: insertedDivision[0] });
  } catch (error) {
    console.error('❌ Add Division Error:', error);
    res.status(500).json({ success: false, message: 'Server error while adding division' });
  }
};

// -------------------- Get All Classes for a School --------------------
exports.getClasses = async (req, res) => {
  try {
    const school_id = Number(req.params.school_id);

    if (!school_id) {
      return res.status(400).json({ success: false, message: 'School ID is required.' });
    }

    const query = `
      SELECT c.*, COUNT(d.id) AS division_count
      FROM classes c
      LEFT JOIN divisions d ON LOWER(c.class_name) = LOWER(d.class_name)
      WHERE c.school_id = :school_id
      GROUP BY c.id
      ORDER BY c.id DESC;
    `;
    const classes = await sequelize.query(query, { replacements: { school_id }, type: QueryTypes.SELECT });

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    console.error('❌ Get Classes Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching classes' });
  }
};
// -------------------- Get Divisions by Class Name --------------------
exports.getDivisions = async (req, res) => {
  try {
    const class_name = req.params.class_name?.trim();

    if (!class_name) {
      return res.status(400).json({ success: false, message: 'Class Name is required.' });
    }

    const divisions = await sequelize.query(
      `
      SELECT * 
      FROM divisions 
      WHERE LOWER(class_name) = LOWER(:class_name)
      ORDER BY id ASC
      `,
      { replacements: { class_name }, type: QueryTypes.SELECT }
    );

    if (divisions.length === 0) {
      return res.status(404).json({ success: false, message: `No divisions found for class '${class_name}'.` });
    }

    res.status(200).json({
      success: true,
      message: `✅ Divisions for class '${class_name}' fetched successfully.`,
      data: divisions,
    });
  } catch (error) {
    console.error('❌ Get Divisions Error:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching divisions' });
  }
};
