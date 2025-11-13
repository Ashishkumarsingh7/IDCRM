const express = require("express");
// केवल उस फ़ंक्शन को इंपोर्ट करें जिसकी हमें अब ज़रूरत है
const { 
  getSchoolFormsSummary
} = require("../controllers/DigitalFormsController"); 
const { verifySchoolAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// GET school-level summary (JSON by default, detailed CSV if ?export=csv)
router.get("/school-summary", verifySchoolAdmin, getSchoolFormsSummary);


module.exports = router;