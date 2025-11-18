const express = require('express');
const router = express.Router();
const { createSuperAdmin, loginSuperAdmin,logoutSuperAdmin } = require('../controllers/superAdminController');

// Create Super Admin
router.post('/create', createSuperAdmin);

// Super Admin Login
router.post('/login', loginSuperAdmin);
router.post('/logout', logoutSuperAdmin);
module.exports = router;
