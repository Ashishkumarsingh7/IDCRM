const express = require('express');
const router = express.Router();
const { createSchoolByTrust, getSchoolsByTrust } = require('../controllers/trustSchoolController');
const { verifyTrustAuth } = require('../middleware/trustAuthMiddleware');

// ---------------- Trust Creates a School ----------------
router.post('/create', verifyTrustAuth, createSchoolByTrust);

// ---------------- Trust Gets All Its Schools ----------------
router.get('/all', verifyTrustAuth, getSchoolsByTrust);

module.exports = router;
