const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");

// ✅ Get pending/approved/rejected summary and waiting days
const getPendingApprovalSummary = async (req, res) => {
  try {
    const teacherId = req.user?.id;
    if (!teacherId)
      return res.status(400).json({ success: false, message: "Teacher ID missing" });

    // 1️⃣ Get teacher name
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

    if (!classes.length)
      return res.json({ success: true, data: { approved: 0, rejected: 0, pending: 0, waitingDays: [] } });

    const classIds = classes.map(c => c.id);

    // 3️⃣ Get all student forms for those classes
    const forms = await sequelize.query(
      `SELECT id, first_name, last_name, status, created_at
       FROM student_forms
       WHERE class_id IN (:classIds)
       ORDER BY created_at ASC`,
      { replacements: { classIds }, type: QueryTypes.SELECT }
    );

    // 4️⃣ Calculate counts
    const approvedCount = forms.filter(f => f.status === 'approved').length;
    const rejectedCount = forms.filter(f => f.status === 'rejected').length;
    const pendingCount = forms.filter(f => f.status === 'pending').length;

    // 5️⃣ Calculate waiting days for pending forms
    const today = new Date();
    const waitingDays = forms
      .filter(f => f.status === 'pending')
      .map(f => ({
        student: `${f.first_name} ${f.last_name}`,
        daysWaiting: Math.floor((today - new Date(f.created_at)) / (1000 * 60 * 60 * 24))
      }));

    return res.json({
      success: true,
      data: {
        approved: approvedCount,
        rejected: rejectedCount,
        pending: pendingCount,
        waitingDays
      }
    });

  } catch (err) {
    console.error("🔥 Error in getPendingApprovalSummary:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getPendingApprovalSummary };
