const express = require("express");
const { getSchoolFormsSummary } = require("../controllers/DigitalFormsController");
const { verifySchoolAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET school-level summary (JSON or CSV)
router.get("/school-summary", verifySchoolAdmin, getSchoolFormsSummary);

module.exports = router;
