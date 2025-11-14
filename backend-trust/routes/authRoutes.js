const express = require('express');
const router = express.Router();
const { loginTrust ,logoutTrust } = require('../controllers/authController');
router.post('/login', loginTrust);
router.post('/logout', logoutTrust);
module.exports = router;
