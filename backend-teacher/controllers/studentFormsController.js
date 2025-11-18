import pool from "../../config/db.js";
import crypto from "crypto";

// -------------------------------------------
//  SUBMIT STUDENT DIGITAL FORM + Auto Share Link
// -------------------------------------------
export const submitStudentForm = async (req, res) => {
  try {
    const teacherId = req.user?.id || null;

    const {
      class_id,
      roll_number,
      first_name,
      last_name,
      dob,
      gender,
      blood_group,
      photo,
      father_name,
      mother_name,
      street_address,
      city,
      state,
      pin_code,
      emergency_contact,
      parent_name,
      parent_phone,
      parent_email,
    } = req.body;

    // ---------- REQUIRED FIELDS ----------
    const requiredFields = {
      class_id,
      roll_number,
      first_name,
      last_name,
      dob,
      gender,
      father_name,
      mother_name,
      street_address,
      city,
      state,
      pin_code,
      emergency_contact,
      parent_phone,
      parent_email,
    };

    const missing = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing_fields: missing,
      });
    }

    // ---------- FETCH CLASS ----------
    const classQuery = await pool.query(
      `SELECT school_id FROM classes WHERE id = $1`,
      [class_id]
    );

    if (classQuery.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Class not found" });
    }

    const school_id = classQuery.rows[0].school_id;

    // ---------- DUPLICATE CHECK ----------
    const duplicateCheck = await pool.query(
      `SELECT id FROM student_forms WHERE class_id = $1 AND roll_number = $2`,
      [class_id, roll_number]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Form already submitted for this student. You can only update it.",
      });
    }

    // ---------- GENERATE TOKEN (Public Share Link) ----------
    const form_token = crypto.randomBytes(8).toString("hex"); // 16-char token

    // ---------- INSERT FORM ----------
    const insertQuery = `
      INSERT INTO student_forms (
        class_id,
        school_id,
        teacher_id,
        roll_number,
        first_name,
        last_name,
        dob,
        gender,
        blood_group,
        photo,
        father_name,
        mother_name,
        street_address,
        city,
        state,
        pin_code,
        emergency_contact,
        parent_name,
        parent_phone,
        parent_email,
        status,
        form_token
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        'submitted',
        $21
      )
      RETURNING *;
    `;

    const values = [
      class_id,
      school_id,
      teacherId,
      roll_number,
      first_name,
      last_name,
      dob,
      gender,
      blood_group || null,
      photo || null,
      father_name,
      mother_name,
      street_address,
      city,
      state,
      pin_code,
      emergency_contact,
      parent_name || null,
      parent_phone,
      parent_email,
      form_token,
    ];

    const result = await pool.query(insertQuery, values);
    const savedForm = result.rows[0];

    // ---------- PUBLIC SHARE LINK ----------
    const publicLink = `${process.env.FRONTEND_URL}/digital-form/${form_token}`;

    // ---------- SUCCESS RESPONSE ----------
    return res.status(201).json({
      success: true,
      message: "Student form submitted & share link generated",
      data: savedForm,
      share_link: publicLink,
    });
  } catch (error) {
    console.error("🔥 Error in submitStudentForm:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
