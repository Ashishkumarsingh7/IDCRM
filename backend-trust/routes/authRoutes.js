const express = require('express');
const router = express.Router();
const { loginTrust } = require('../controllers/authController');

router.post('/login', loginTrust);

module.exports = router;
