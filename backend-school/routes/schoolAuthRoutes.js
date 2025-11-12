const express = require('express');
const router = express.Router();
const { loginSchool } = require('../controllers/schoolAuthController');

// ---------------- School Login ----------------
router.post('/login', loginSchool);

module.exports = router;
