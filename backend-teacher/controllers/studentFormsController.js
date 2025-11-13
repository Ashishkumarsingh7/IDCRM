import pool from "../../config/db.js";

// ✅ Submit Student Form (Student can submit directly)
export const submitStudentForm = async (req, res) => {
  try {
    // ✅ Teacher ID optional — if student submits form, this will be null
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

    // ✅ Validate required fields
    if (
      !class_id ||
      !roll_number ||
      !first_name ||
      !last_name ||
      !dob ||
      !gender ||
      !father_name ||
      !mother_name ||
      !street_address ||
      !city ||
      !state ||
      !pin_code ||
      !emergency_contact ||
      !parent_phone ||
      !parent_email
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All required fields must be filled" });
    }

    // ✅ Get class info (fetch school_id)
    const classResult = await pool.query("SELECT * FROM classes WHERE id = $1", [
      class_id,
    ]);
    const classInfo = classResult.rows[0];

    if (!classInfo) {
      return res.status(404).json({ success: false, message: "Class not found" });
    }

    const school_id = classInfo.school_id;

    // ✅ Check if form already exists for this roll number in the same class
    const existingForm = await pool.query(
      `SELECT * FROM student_forms WHERE class_id = $1 AND roll_number = $2`,
      [class_id, roll_number]
    );

    if (existingForm.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Form already submitted for this student. You can only update it.",
      });
    }

    // ✅ Insert new student form
    const insertResult = await pool.query(
      `INSERT INTO student_forms 
        (class_id, school_id, teacher_id, roll_number, first_name, last_name, dob, gender, blood_group, photo, father_name, mother_name, street_address, city, state, pin_code, emergency_contact, parent_name, parent_phone, parent_email) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING *`,
      [
        class_id,
        school_id,
        teacherId, // may be null if submitted by student
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
      ]
    );

    const savedForm = insertResult.rows[0];

    return res.status(201).json({
      success: true,
      message: "Student form submitted successfully",
      data: savedForm,
    });
  } catch (error) {
    console.error("🔥 Error in submitStudentForm:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
