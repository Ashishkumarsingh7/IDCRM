// const sequelize = require("../../config/db");
// const { QueryTypes } = require("sequelize");
// const { Parser } = require("json2csv");
// const crypto = require("crypto");

// /**
//  * Generate unique student IDs for approved students who don't have an ID yet.
//  * Supports optional CSV export via query parameter ?export=csv
//  */
// const generateStudentIDs = async (req, res) => {
//   try {
//     // ✅ 1. Validate school ID from JWT
//     const schoolId = parseInt(req.user?.school_id, 10);
//     if (!schoolId) {
//       return res.status(400).json({ success: false, message: "School ID missing" });
//     }

//     // ✅ 2. Count total approved students for this school
//     const totalApproved = await sequelize.query(
//       `SELECT COUNT(*) AS total 
//        FROM student_forms 
//        WHERE school_id = :schoolId 
//        AND LOWER(status) = 'approved'`,
//       { replacements: { schoolId }, type: QueryTypes.SELECT }
//     );
//     const totalApprovedCount = parseInt(totalApproved[0].total, 10);

//     // ✅ 3. Count students who already have generated IDs
//     const totalPrinted = await sequelize.query(
//       `SELECT COUNT(*) AS total 
//        FROM student_generated_ids 
//        WHERE school_id = :schoolId`,
//       { replacements: { schoolId }, type: QueryTypes.SELECT }
//     );
//     const totalPrintedCount = parseInt(totalPrinted[0].total, 10);

//     // ✅ 4. Fetch approved students without generated IDs
//     const students = await sequelize.query(
//       `SELECT sf.id AS student_form_id, 
//               sf.roll_number,
//               sf.first_name || ' ' || sf.last_name AS student_name,
//               sf.dob,
//               sf.blood_group,
//               sf.street_address || ', ' || sf.city || ', ' || sf.state || ', ' || sf.pin_code AS address,
//               sf.father_name,
//               COALESCE(sf.father_phone, sf.parent_phone, '') AS father_phone,
//               sf.mother_name,
//               COALESCE(sf.mother_phone, '') AS mother_phone,
//               sf.emergency_contact
//        FROM student_forms sf
//        LEFT JOIN student_generated_ids sg
//               ON sf.id = sg.student_form_id
//        WHERE sf.school_id = :schoolId
//          AND LOWER(sf.status) = 'approved'
//          AND sg.student_form_id IS NULL
//        ORDER BY sf.class_id, sf.roll_number`,
//       { replacements: { schoolId }, type: QueryTypes.SELECT }
//     );

//     // ✅ 5. If no students left to generate IDs
//     if (!students.length) {
//       return res.json({
//         success: true,
//         message: "All approved students already have generated IDs",
//         total_approved: totalApprovedCount,
//         total_printed: totalPrintedCount,
//         total_remaining: totalApprovedCount - totalPrintedCount,
//         data: []
//       });
//     }

//     // ✅ 6. Generate unique IDs and insert into database
//     const generatedData = [];
//     for (const student of students) {
//       const generatedId = crypto.randomBytes(6).toString("hex").toUpperCase();

//       await sequelize.query(
//         `INSERT INTO student_generated_ids (student_form_id, school_id, generated_id, credits_deducted, created_at)
//          VALUES (:student_form_id, :school_id, :generated_id, 15, NOW())`,
//         {
//           replacements: {
//             student_form_id: student.student_form_id,
//             school_id: schoolId,
//             generated_id: generatedId
//           },
//           type: QueryTypes.INSERT
//         }
//       );

//       generatedData.push({ ...student, generated_id: generatedId, credits_deducted: 15 });
//     }

//     const totalGenerated = generatedData.length;

//     // ✅ 7. Export as CSV if requested
//     if (req.query.export?.toLowerCase() === "csv") {
//       const parser = new Parser();
//       const csv = parser.parse(generatedData);
//       res.header("Content-Type", "text/csv");
//       res.attachment("generated_student_ids.csv");
//       return res.send(csv);
//     }

//     // ✅ 8. Return JSON response
//     return res.json({
//       success: true,
//       message: `${totalGenerated} IDs generated successfully`,
//       total_approved: totalApprovedCount,
//       total_printed: totalPrintedCount + totalGenerated,
//       total_remaining: totalApprovedCount - (totalPrintedCount + totalGenerated),
//       data: generatedData
//     });

//   } catch (err) {
//     console.error("🔥 Error in generateStudentIDs:", err);
//     return res.status(500).json({ success: false, message: "Server error while generating student IDs" });
//   }
// };

// module.exports = { generateStudentIDs };
// backend-school/controllers/studentIDController.js

const sequelize = require("../../config/db");
const { QueryTypes } = require("sequelize");
const { Parser } = require("json2csv");
const crypto = require("crypto");


/* ----------------------------------------------------
   🔵 GET CONTROLLER → ONLY SHOW STATUS (NO GENERATION)
---------------------------------------------------- */
const getIDStatus = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.school_id, 10);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID missing",
      });
    }

    // Count approved
    const totalApproved = await sequelize.query(
      `SELECT COUNT(*) AS total
       FROM student_forms
       WHERE school_id = :schoolId
       AND LOWER(TRIM(status)) = 'approved'`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );
    const totalApprovedCount = parseInt(totalApproved[0].total, 10);

    // Count printed
    const totalPrinted = await sequelize.query(
      `SELECT COUNT(*) AS total
       FROM student_generated_ids
       WHERE school_id = :schoolId`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );
    const totalPrintedCount = parseInt(totalPrinted[0].total, 10);

    // If completed
    if (totalApprovedCount === totalPrintedCount) {
      return res.json({
        success: true,
        message: "All approved students already have generated IDs",
        total_approved: totalApprovedCount,
        total_printed: totalPrintedCount,
        total_remaining: 0,
        data: [],
      });
    }

    return res.json({
      success: true,
      message: "Some students still need ID generation",
      total_approved: totalApprovedCount,
      total_printed: totalPrintedCount,
      total_remaining: totalApprovedCount - totalPrintedCount,
    });

  } catch (err) {
    console.error("🔥 Error in getIDStatus:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while checking ID status",
    });
  }
};



/* ----------------------------------------------------
   🔴 POST CONTROLLER → ONLY GENERATE IDs
---------------------------------------------------- */
const generateStudentIDs = async (req, res) => {
  try {
    const schoolId = parseInt(req.user?.school_id, 10);

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID missing",
      });
    }

    // Fetch approved students without IDs
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
         AND LOWER(TRIM(sf.status)) = 'approved'
         AND sg.student_form_id IS NULL
       ORDER BY sf.class_id, sf.roll_number`,
      { replacements: { schoolId }, type: QueryTypes.SELECT }
    );

    // If nothing to generate
    if (students.length === 0) {
      return res.json({
        success: true,
        message: "No pending students to generate IDs",
        data: [],
      });
    }

    const generatedData = [];

    // Generate & insert
    for (const student of students) {
      const generatedId = crypto.randomBytes(6).toString("hex").toUpperCase();

      await sequelize.query(
        `INSERT INTO student_generated_ids 
         (student_form_id, school_id, generated_id, credits_deducted, created_at)
         VALUES (:student_form_id, :school_id, :generated_id, 15, NOW())`,
        {
          replacements: {
            student_form_id: student.student_form_id,
            school_id: schoolId,
            generated_id: generatedId,
          },
          type: QueryTypes.INSERT,
        }
      );

      generatedData.push({
        ...student,
        generated_id: generatedId,
        credits_deducted: 15,
      });
    }

    const totalGenerated = generatedData.length;

    // CSV Export
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
      data: generatedData,
    });

  } catch (err) {
    console.error("🔥 Error in generateStudentIDs:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while generating student IDs",
    });
  }
};


module.exports = { getIDStatus, generateStudentIDs };
