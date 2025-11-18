// const sequelize = require("../../config/db");
// const { QueryTypes } = require("sequelize");

// // ✅ Get all student forms for teacher's class
// const getStudentForms = async (req, res) => {
//   try {
//     const teacherId = req.user?.id;
//     if (!teacherId)
//       return res.status(400).json({ success: false, message: "Teacher ID missing" });

//     // 1️⃣ Get teacher name from teachers table
//     const teacher = await sequelize.query(
//       `SELECT name FROM teachers WHERE id = :id`,
//       { replacements: { id: teacherId }, type: QueryTypes.SELECT }
//     );

//     if (!teacher.length)
//       return res.status(404).json({ success: false, message: "Teacher not found" });

//     const teacherName = teacher[0].name;

//     // 2️⃣ Get class IDs assigned to this teacher
//     const classes = await sequelize.query(
//       `SELECT id FROM classes WHERE class_teacher = :teacherName`,
//       { replacements: { teacherName }, type: QueryTypes.SELECT }
//     );

//     if (!classes.length) return res.json({ success: true, data: [] });

//     const classIds = classes.map(c => c.id);

//     // 3️⃣ Get student forms for those classes
//     const forms = await sequelize.query(
//       `SELECT sf.id, sf.first_name, sf.last_name, sf.roll_number, sf.status, sf.created_at
//        FROM student_forms sf
//        WHERE sf.class_id IN (:classIds)
//        ORDER BY sf.created_at DESC`,
//       { replacements: { classIds }, type: QueryTypes.SELECT }
//     );

//     return res.json({ success: true, data: forms });
//   } catch (err) {
//     console.error("🔥 Error in getStudentForms:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// // ✅ Approve / Reject a student form
// const updateFormStatus = async (req, res) => {
//   try {
//     const teacherId = req.user?.id;
//     const { id } = req.params;
//     const { status } = req.body; // expected: 'approved' or 'rejected'

//     if (!['approved', 'rejected'].includes(status))
//       return res.status(400).json({ success: false, message: "Invalid status" });

//     // 1️⃣ Get teacher name
//     const teacher = await sequelize.query(
//       `SELECT name FROM teachers WHERE id = :id`,
//       { replacements: { id: teacherId }, type: QueryTypes.SELECT }
//     );

//     if (!teacher.length)
//       return res.status(404).json({ success: false, message: "Teacher not found" });

//     const teacherName = teacher[0].name;

//     // 2️⃣ Verify form belongs to teacher's class
//     const form = await sequelize.query(
//       `SELECT sf.*, c.class_teacher
//        FROM student_forms sf
//        JOIN classes c ON sf.class_id = c.id
//        WHERE sf.id = :id`,
//       { replacements: { id }, type: QueryTypes.SELECT }
//     );

//     if (!form.length) return res.status(404).json({ success: false, message: "Form not found" });
//     if (form[0].class_teacher !== teacherName)
//       return res.status(403).json({ success: false, message: "Not authorized" });

//     // 3️⃣ Update status
//     await sequelize.query(
//       `UPDATE student_forms SET status = :status, updated_at = now() WHERE id = :id`,
//       { replacements: { status, id }, type: QueryTypes.UPDATE }
//     );

//     return res.json({ success: true, message: `Form ${status} successfully` });
//   } catch (err) {
//     console.error("🔥 Error in updateFormStatus:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

// module.exports = { getStudentForms, updateFormStatus };
const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");

// ✅ Get all student forms for teacher's class
const getStudentForms = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId)
      return res.status(400).json({ success: false, message: "Teacher ID missing" });

    // 1️⃣ Get teacher name from teachers table
    const teacher = await sequelize.query(
      `SELECT name FROM teachers WHERE id = :id`,
      { replacements: { id: teacherId }, type: QueryTypes.SELECT }
    );

    if (!teacher.length)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    const teacherName = teacher[0].name;

    // 2️⃣ Get class IDs assigned to this teacher
    const classes = await sequelize.query(
      `SELECT id FROM classes WHERE class_teacher = :teacherName`,
      { replacements: { teacherName }, type: QueryTypes.SELECT }
    );

    if (!classes.length) return res.json({ success: true, data: [] });

    const classIds = classes.map(c => c.id);

    // 3️⃣ Get student forms for those classes
    const forms = await sequelize.query(
      `SELECT sf.id, sf.first_name, sf.last_name, sf.roll_number, sf.status, sf.created_at
       FROM student_forms sf
       WHERE sf.class_id IN (:classIds)
       ORDER BY sf.created_at DESC`,
      { replacements: { classIds }, type: QueryTypes.SELECT }
    );

    // 4️⃣ Add link to each form
    const formsWithLinks = forms.map(f => ({
      ...f,
      link: `/teacher/student-form/${f.id}`
    }));

    return res.json({ success: true, data: formsWithLinks });
  } catch (err) {
    console.error("🔥 Error in getStudentForms:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Approve / Reject a student form
const updateFormStatus = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    const { id } = req.params;
    const { status } = req.body; // expected: 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    // 1️⃣ Get teacher name
    const teacher = await sequelize.query(
      `SELECT name FROM teachers WHERE id = :id`,
      { replacements: { id: teacherId }, type: QueryTypes.SELECT }
    );

    if (!teacher.length)
      return res.status(404).json({ success: false, message: "Teacher not found" });

    const teacherName = teacher[0].name;

    // 2️⃣ Verify form belongs to teacher's class
    const form = await sequelize.query(
      `SELECT sf.*, c.class_teacher
       FROM student_forms sf
       JOIN classes c ON sf.class_id = c.id
       WHERE sf.id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!form.length)
      return res.status(404).json({ success: false, message: "Form not found" });

    if (form[0].class_teacher !== teacherName)
      return res.status(403).json({ success: false, message: "Not authorized" });

    // 3️⃣ Update status
    await sequelize.query(
      `UPDATE student_forms SET status = :status, updated_at = now() WHERE id = :id`,
      { replacements: { status, id }, type: QueryTypes.UPDATE }
    );

    return res.json({ success: true, message: `Form ${status} successfully` });
  } catch (err) {
    console.error("🔥 Error in updateFormStatus:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getStudentForms, updateFormStatus };
