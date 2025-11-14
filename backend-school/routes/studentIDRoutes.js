const express = require("express");
const router = express.Router();
const { generateStudentIDs } = require("../controllers/studentIDController");
const { verifySchoolAdmin } = require("../middleware/authMiddleware"); // JWT middleware to get school_id

// POST /api/school/generate-ids
router.post("/generate-ids", verifySchoolAdmin, generateStudentIDs);

module.exports = router;
