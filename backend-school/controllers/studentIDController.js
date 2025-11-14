const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");
const { Parser } = require("json2csv");
const crypto = require("crypto"); // For unique ID generation

// ---------------- Generate Student IDs ----------------
const generateStudentIDs = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.school_id, 10); // JWT se
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing" });
    }

    // ✅ Get approved students without generated IDs
    const students = await sequelize.query(
      `SELECT sf.id AS student_form_id, 
              sf.roll_number,
              sf.first_name || ' ' || sf.last_name AS student_name,
              sf.dob,
              sf.blood_group,
              sf.street_address || ', ' || sf.city || ', ' || sf.state || ', ' || sf.pin_code AS address,
              sf.father_name,
              COALESCE(sf.father_phone, sf.parent_phone, '') AS father_phone,
              sf.mother_name,
              COALESCE(sf.mother_phone, '') AS mother_phone,
              sf.emergency_contact
       FROM student_forms sf
       LEFT JOIN student_generated_ids sg
              ON sf.id = sg.student_form_id
       WHERE sf.school_id = :schoolId
         AND LOWER(sf.status) = 'approved'
         AND sg.student_form_id IS NULL
       ORDER BY sf.class_id, sf.roll_number`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );

    if (!students.length) {
      return res.json({ success: true, message: "All approved students already have generated IDs", data: [] });
    }

    // ✅ Generate IDs and insert into student_generated_ids
    const generatedData = [];
    for (const student of students) {
      const generatedId = crypto.randomBytes(6).toString("hex").toUpperCase(); // 12-char unique ID

      await sequelize.query(
        `INSERT INTO student_generated_ids (student_form_id, school_id, generated_id, credits_deducted, created_at)
         VALUES (:student_form_id, :school_id, :generated_id, 15, NOW())`,
        { replacements: { student_form_id: student.student_form_id, school_id: schoolId, generated_id: generatedId }, type: QueryTypes.INSERT }
      );

      generatedData.push({ ...student, generated_id: generatedId, credits_deducted: 15 });
    }

    const totalGenerated = generatedData.length;

    // ✅ CSV Export Option
    if (req.query.export?.toLowerCase() === "csv") {
      const parser = new Parser();
      const csv = parser.parse(generatedData);
      res.header("Content-Type", "text/csv");
      res.attachment("generated_student_ids.csv");
      return res.send(csv);
    }

    return res.json({
      success: true,
      message: `${totalGenerated} IDs generated successfully`,
      total_generated: totalGenerated,
      data: generatedData
    });

  } catch (err) {
    console.error("🔥 Error in generateStudentIDs:", err);
    return res.status(500).json({ success: false, message: "Server error while generating student IDs" });
  }
};

module.exports = { generateStudentIDs };
