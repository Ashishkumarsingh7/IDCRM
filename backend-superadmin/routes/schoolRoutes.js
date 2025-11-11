// backend-superadmin/routes/schoolRoutes.js
const express = require('express');
const router = express.Router();
const { createSchool, updateSchool, getAllSchools } = require('../controllers/schoolController');
const { verifySuperAdmin } = require('../middleware/authMiddleware');

// ---------------- Create a new School ----------------
router.post('/create', verifySuperAdmin, createSchool);

// ---------------- Update a School ----------------
router.patch('/:id', verifySuperAdmin, updateSchool);

// ---------------- Get All Schools ----------------
router.get('/all', verifySuperAdmin, getAllSchools);

module.exports = router;
