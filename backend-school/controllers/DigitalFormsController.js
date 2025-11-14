const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");
const { Parser } = require("json2csv");

const getSchoolFormsSummary = async (req, res) => {
  try {
    // 1️⃣ Get school_id from logged-in user
    const schoolId = parseInt(req.user?.school_id, 10);
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing" });
    }

    // 2️⃣ CSV Export
    if (req.query.export?.toLowerCase() === "csv") {
      const approvedForms = await sequelize.query(
        `SELECT 
          sf.roll_number AS "Roll No",
          sf.first_name || ' ' || sf.last_name AS "Student Name",
          sf.dob AS "DOB",
          sf.blood_group AS "Blood",
          sf.street_address || ', ' || sf.city || ', ' || sf.state || ', ' || sf.pin_code AS "Address",
          sf.father_name AS "Father Name",
          COALESCE(sf.father_phone, sf.parent_phone, '') AS "Father Phone",
          sf.mother_name AS "Mother Name",
          COALESCE(sf.mother_phone, '') AS "Mother Phone",
          sf.emergency_contact AS "Emergency",
          sf.status AS "Status"
        FROM student_forms sf
        WHERE sf.school_id = :schoolId AND LOWER(sf.status) = 'approved'
        ORDER BY sf.class_id, sf.roll_number`,
        { replacements: { schoolId }, type: QueryTypes.SELECT }
      );

      if (!approvedForms.length) {
        return res.json({ success: true, message: "No approved forms found to export", data: [] });
      }

      const parser = new Parser();
      const csv = parser.parse(approvedForms);

      res.header("Content-Type", "text/csv");
      res.attachment("approved_student_forms.csv");
      return res.send(csv);
    }

    // Default JSON Summary (UPDATED WITH class_teacher)
    const classes = await sequelize.query(
      `SELECT 
          c.id,
          c.class_name,
          d.division_name,
          d.class_teacher
       FROM classes c
       LEFT JOIN divisions d 
           ON d.class_name = c.class_name
       WHERE c.school_id = :schoolId
       ORDER BY c.class_name, d.division_name`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );

    if (!classes.length) return res.json({ success: true, data: [] });

    const classIds = classes.map(c => c.id);

    const forms = await sequelize.query(
      `SELECT class_id, 
              COUNT(*) AS total_forms,
              COUNT(*) FILTER (WHERE LOWER(status) = 'approved') AS approved,
              COUNT(*) FILTER (WHERE LOWER(status) = 'rejected') AS rejected,
              COUNT(*) FILTER (WHERE LOWER(status) = 'pending') AS pending
       FROM student_forms
       WHERE class_id IN (:classIds)
       GROUP BY class_id`,
      { replacements: { classIds }, type: QueryTypes.SELECT }
    );

    const summary = classes.map(cls => {
      const formData = forms.find(f => f.class_id === cls.id) || {};
      return {
        class_name: cls.class_name,
        division_name: cls.division_name || "N/A",
        class_teacher: cls.class_teacher || "N/A",  // ✅ ADDED HERE
        total_forms: parseInt(formData.total_forms || 0, 10),
        approved: parseInt(formData.approved || 0, 10),
        rejected: parseInt(formData.rejected || 0, 10),
        pending: parseInt(formData.pending || 0, 10),
      };
    });

    return res.json({ success: true, data: summary });

  } catch (err) {
    console.error("🔥 Error in getSchoolFormsSummary:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getSchoolFormsSummary };
