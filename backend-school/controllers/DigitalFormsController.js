const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");
const { Parser } = require("json2csv"); // CSV export

// ✅ School level summary with CSV export
const getSchoolFormsSummary = async (req, res) => {
  try {
    // 1️⃣ Get school_id from JWT
    const schoolId = req.user?.school_id;
    if (!schoolId) {
      return res.status(400).json({ success: false, message: "School ID missing" });
    }

    // 2️⃣ Get classes for the school along with teacher name
    const classes = await sequelize.query(
      `SELECT c.id, c.name AS class_name, c.division, t.name AS class_teacher
       FROM classes c
       LEFT JOIN teachers t ON c.class_teacher = t.name
       WHERE c.school_id = :schoolId`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );

    if (!classes.length) return res.json({ success: true, data: [] });

    const classIds = classes.map(c => c.id);

    // 3️⃣ Get form counts per class
    const forms = await sequelize.query(
      `SELECT class_id, 
              COUNT(*) AS total_forms,
              COUNT(*) FILTER (WHERE status='approved') AS approved,
              COUNT(*) FILTER (WHERE status='rejected') AS rejected,
              COUNT(*) FILTER (WHERE status='pending') AS pending
       FROM student_forms
       WHERE class_id IN (:classIds)
       GROUP BY class_id`,
      { replacements: { classIds }, type: QueryTypes.SELECT }
    );

    // 4️⃣ Merge class info with form counts
    const summary = classes.map(cls => {
      const formData = forms.find(f => f.class_id === cls.id) || {};
      return {
        class_name: cls.class_name,
        division: cls.division,
        class_teacher: cls.class_teacher || "N/A",
        total_forms: parseInt(formData.total_forms || 0, 10),
        approved: parseInt(formData.approved || 0, 10),
        rejected: parseInt(formData.rejected || 0, 10),
        pending: parseInt(formData.pending || 0, 10)
      };
    });

    // 5️⃣ CSV export if requested
    if (req.query.export && req.query.export.toLowerCase() === "csv") {
      const parser = new Parser();
      const csv = parser.parse(summary);
      res.header("Content-Type", "text/csv");
      res.attachment("school_forms_summary.csv");
      return res.send(csv);
    }

    // 6️⃣ Default JSON response
    return res.json({ success: true, data: summary });

  } catch (err) {
    console.error("🔥 Error in getSchoolFormsSummary:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getSchoolFormsSummary
};
