const express = require('express');
const router = express.Router();
const { addTeacher, getTeachers } = require('../controllers/teacherController');
const { verifySchoolAdmin } = require('../middleware/authMiddleware');

// Add Teacher
router.post('/create', verifySchoolAdmin, addTeacher);

// Get Teachers by School
router.get('/school/:school_id', verifySchoolAdmin, getTeachers);

module.exports = router;
