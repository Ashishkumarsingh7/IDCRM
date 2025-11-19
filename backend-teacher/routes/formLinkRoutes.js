// // backend-school/routes/formLinkRoutes.js
// const express = require('express');
// const router = express.Router();
// const { createFormLink, getFormLinks } = require('../controllers/formLinkController');
// const { verifyTeacher } = require('../middleware/auth'); //

// //  Generate a new link
// router.post('/generate', verifyTeacher, createFormLink);

// // ✅ Get all links for a school
// router.get('/school/:school_id', verifyTeacher, getFormLinks);

// module.exports = router;
// backend-school/routes/formLinkRoutes.js
const express = require('express');
const router = express.Router();
const {
    createFormLink,
    getFormLinks,
    submitForm,
    getFormSubmissions
} = require('../controllers/formLinkController');
const { verifyTeacher } = require('../middleware/auth');


// Generate a new form link

router.post('/generate', verifyTeacher, createFormLink);


// Get all links for a school

router.get('/school/:school_id', verifyTeacher, getFormLinks);

// ----------------------------
// Submit form using token (frontend public)
// ----------------------------
router.post('/submit/:token', submitForm);


// Optional: Get all submissions for a form link

router.get('/submissions/:token', verifyTeacher, getFormSubmissions);

module.exports = router;
