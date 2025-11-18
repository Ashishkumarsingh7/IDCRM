const express = require("express");
const { getStudentForms, updateFormStatus } = require("../controllers/teacherStudentFormsController");
const { verifyTeacher } = require("../middleware/auth");

const router = express.Router();

// GET all student forms for teacher's class
router.get("/", verifyTeacher, getStudentForms);

// PATCH form status (approve/reject)
router.patch("/:id", verifyTeacher, updateFormStatus);

module.exports = router;
