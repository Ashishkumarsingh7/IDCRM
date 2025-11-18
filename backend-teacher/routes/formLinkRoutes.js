// backend-school/routes/formLinkRoutes.js
const express = require('express');
const router = express.Router();
const { createFormLink, getFormLinks } = require('../controllers/formLinkController');
const { verifyTeacher } = require('../middleware/auth'); //

//  Generate a new link
router.post('/generate', verifyTeacher, createFormLink);

// ✅ Get all links for a school
router.get('/school/:school_id', verifyTeacher, getFormLinks);

module.exports = router;
