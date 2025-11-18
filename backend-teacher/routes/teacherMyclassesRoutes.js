const express = require('express');
const router = express.Router();
const { getTeacherDashboard } = require('../controllers/teacherMyclassesController');
const { verifyTeacher } = require('../middleware/auth');

// Teacher dashboard route
router.get('/dashboard', verifyTeacher, getTeacherDashboard);

module.exports = router;
