import pool from '../../config/db.js'; // your PostgreSQL connection pool

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id; // from auth middleware

    // 1️⃣ Get teacher details
    const teacherResult = await pool.query(
      `SELECT * FROM teachers WHERE id = $1`,
      [teacherId]
    );
    const teacher = teacherResult.rows[0];

    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher not found" });
    }

    // 2️⃣ Count total students in the teacher's school
    const totalStudentsResult = await pool.query(
      `SELECT COUNT(*) AS total_students FROM students WHERE school_id = $1`,
      [teacher.school_id]
    );
    const totalStudents = totalStudentsResult.rows[0].total_students;

    // 3️⃣ Find if teacher is assigned as class teacher
    const classResult = await pool.query(
      `SELECT * FROM classes WHERE class_teacher = $1 AND school_id = $2`,
      [teacher.name, teacher.school_id]
    );
    const assignedClass = classResult.rows[0];

    let classStudentCount = 0;

    // 4️⃣ If teacher has a class, count students in it
    if (assignedClass) {
      const classStudentResult = await pool.query(
        `SELECT COUNT(*) AS class_students FROM students WHERE class_id = $1`,
        [assignedClass.id]
      );
      classStudentCount = classStudentResult.rows[0].class_students;
    }

    res.json({
      success: true,
      data: {
        teacherName: teacher.name,
        totalStudents,
        assignedClass: assignedClass ? assignedClass.class_name : null,
        section: assignedClass ? assignedClass.section : null,
        classStudentCount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
