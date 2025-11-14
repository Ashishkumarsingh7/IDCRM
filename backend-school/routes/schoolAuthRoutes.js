const express = require('express');
const router = express.Router();
const { loginSchool, logoutSchool } = require('../controllers/schoolAuthController');

router.post('/login', loginSchool);
router.post('/logout', logoutSchool);

module.exports = router;
