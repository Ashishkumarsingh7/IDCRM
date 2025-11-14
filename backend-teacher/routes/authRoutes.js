const express = require('express');
const router = express.Router();
const { loginTeacher, logoutTeacher } = require('../controllers/authController');

// -------------------- Teacher Login --------------------
router.post('/login', loginTeacher);

// -------------------- Teacher Logout --------------------
router.post('/logout', logoutTeacher);

module.exports = router;
