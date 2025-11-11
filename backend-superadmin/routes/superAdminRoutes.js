const express = require('express');
const router = express.Router();
const { createSuperAdmin, loginSuperAdmin } = require('../controllers/superAdminController');

// Create Super Admin
router.post('/create', createSuperAdmin);

// Super Admin Login
router.post('/login', loginSuperAdmin);

module.exports = router;
