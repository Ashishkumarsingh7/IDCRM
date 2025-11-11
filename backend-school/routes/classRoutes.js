// backend-superadmin/routes/classRoutes.js
const express = require('express');
const router = express.Router();
const { addClass, addDivision, getClasses, getDivisions } = require('../controllers/classController');
const { verifySuperAdmin } = require('../middleware/authMiddleware');

// ---------------- Add Class ----------------
router.post('/create', verifySuperAdmin, addClass);

// ---------------- Add Division ----------------
router.post('/division', verifySuperAdmin, addDivision);

// ---------------- Get All Classes for a School ----------------
router.get('/school/:school_id', verifySuperAdmin, getClasses);

// ---------------- Get Divisions of a Class ----------------
router.get('/class/:class_id/divisions', verifySuperAdmin, getDivisions);

module.exports = router;
