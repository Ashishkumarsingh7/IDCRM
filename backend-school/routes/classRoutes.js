
const express = require('express');
const router = express.Router();
const { addClass, addDivision, getClasses, getDivisions } = require('../controllers/classController');
const { verifySchoolAdmin } = require('../middleware/authMiddleware');

// ---------------- Add Class ----------------
router.post('/create', verifySchoolAdmin, addClass);
// ---------------- Add Division ----------------
router.post('/division', verifySchoolAdmin, addDivision);
// ---------------- Get All Classes for a School ----------------
router.get('/school/:school_id', verifySchoolAdmin, getClasses);

// ---------------- Get Divisions of a Class ----------------
router.get('/class/:class_name/divisions', verifySchoolAdmin, getDivisions);

module.exports = router;
