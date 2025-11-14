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

    // 2️⃣ Fetch divisions assigned to this teacher
    const divisions = await sequelize.query(
      `SELECT id AS division_id, division_name, class_name
       FROM divisions
       WHERE class_teacher = :teacherName`,
      { replacements: { teacherName: teacher.name }, type: QueryTypes.SELECT }
    );

    // 3️⃣ For each division, count students
    const divisionsWithCount = await Promise.all(divisions.map(async (div) => {
      const studentCountResult = await sequelize.query(
        `SELECT COUNT(*) AS student_count 
         FROM students 
         WHERE division_id = :divisionId`,
        { replacements: { divisionId: div.division_id }, type: QueryTypes.SELECT }
      );

      return {
        division_id: div.division_id,
        division_name: div.division_name,
        class_name: div.class_name,
        student_count: parseInt(studentCountResult[0].student_count, 10),
      };
    }));

    // 4️⃣ Total students in this teacher's school
    const totalStudentsResult = await sequelize.query(
      'SELECT COUNT(*) AS total_students FROM students WHERE school_id = :schoolId',
      { replacements: { schoolId: teacher.school_id }, type: QueryTypes.SELECT }
    );
    const totalStudents = parseInt(totalStudentsResult[0].total_students, 10);

    // 5️⃣ Return response
    return res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        totalStudents,
        divisions: divisionsWithCount,
      },
    });

  } catch (error) {
    console.error('🔥 Error in getTeacherDashboard:', error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
