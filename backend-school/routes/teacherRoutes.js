const express = require('express');
const router = express.Router();
const { addTeacher, getTeachers } = require('../controllers/teacherController');
const { verifySuperAdmin } = require('../middleware/authMiddleware');

// Add Teacher
router.post('/create', verifySuperAdmin, addTeacher);

// Get Teachers by School
router.get('/school/:school_id', verifySuperAdmin, getTeachers);

module.exports = router;
