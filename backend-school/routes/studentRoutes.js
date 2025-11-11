const express = require('express');
const router = express.Router();
const { addStudent, getStudents } = require('../controllers/studentController');
const { verifySuperAdmin } = require('../middleware/authMiddleware'); // Or verifySchoolAdmin later

// Add a new student
router.post('/create', verifySuperAdmin, addStudent);

// Get all students of a school
router.get('/school/:school_id', verifySuperAdmin, getStudents);

module.exports = router;
