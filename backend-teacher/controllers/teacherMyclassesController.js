import sequelizePkg from 'sequelize';
const { QueryTypes } = sequelizePkg;

import sequelize from '../../config/db.js';

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user?.id;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: "Teacher info missing in JWT" });
    }

    // 1️⃣ Fetch teacher details
    const teachers = await sequelize.query(
      'SELECT * FROM teachers WHERE id = :teacherId',
      { replacements: { teacherId }, type: QueryTypes.SELECT }
    );

    const teacher = teachers[0];
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // 2️⃣ Count total students in school
    const totalStudentsResult = await sequelize.query(
      'SELECT COUNT(*) AS total_students FROM students WHERE school_id = :schoolId',
      { replacements: { schoolId: teacher.school_id }, type: QueryTypes.SELECT }
    );

    const totalStudents = parseInt(totalStudentsResult[0].total_students, 10);

    // 3️⃣ Find assigned class
    const classResult = await sequelize.query(
      'SELECT * FROM classes WHERE class_teacher = :teacherName AND school_id = :schoolId',
      { replacements: { teacherName: teacher.name, schoolId: teacher.school_id }, type: QueryTypes.SELECT }
    );

    const assignedClass = classResult[0] || null;

    // 4️⃣ Count students in assigned class
    let classStudentCount = 0;
    if (assignedClass) {
      const classStudentResult = await sequelize.query(
        'SELECT COUNT(*) AS class_students FROM students WHERE class_id = :classId',
        { replacements: { classId: assignedClass.id }, type: QueryTypes.SELECT }
      );
      classStudentCount = parseInt(classStudentResult[0].class_students, 10);
    }

    // 5️⃣ Return response
    return res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        totalStudents,
        assignedClass: assignedClass?.class_name || null,
        section: assignedClass?.section || null,
        classStudentCount,
      },
    });

  } catch (error) {
    console.error('🔥 Error in getTeacherDashboard:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
