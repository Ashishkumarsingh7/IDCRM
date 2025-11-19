// backend-school/controllers/formLinkController.js
const FormLink = require('../models/FormLink');
const FormSubmission = require('../models/FormLink'); // New model to store submitted form data
const crypto = require('crypto');
const { Op } = require('sequelize');

// Generate a unique token
const generateToken = () => crypto.randomBytes(16).toString('hex');

// ========================
// 1) CREATE FORM LINK
// ========================
exports.createFormLink = async (req, res) => {
    try {
        const { school_id, class_name, division } = req.body;

        if (!school_id || !class_name) {
            return res.status(400).json({ success: false, message: 'School ID and Class are required' });
        }

        const token = generateToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // link valid for 7 days

        const link = await FormLink.create({
            token,
            school_id,
            class_name,
            division,
            expires_at: expiresAt,
        });

        res.status(201).json({
            success: true,
            message: 'Form link generated successfully',
            link: `https://yourfrontend.com/form/${token}`,
            data: link
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================
// 2) SUBMIT FORM
// ========================
exports.submitForm = async (req, res) => {
    try {
        const { token } = req.params;
        const formData = req.body;

        // Check if token exists and is valid
        const formLink = await FormLink.findOne({
            where: {
                token,
                expires_at: { [Op.gt]: new Date() } // Not expired
            }
        });

        if (!formLink) {
            return res.status(400).json({ success: false, message: 'Invalid or expired form link' });
        }

        // Save submitted data
        const submission = await FormSubmission.create({
            form_link_id: formLink.id,
            data: formData
        });

        res.status(201).json({
            success: true,
            message: 'Form submitted successfully',
            data: submission
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================
// 3) GET ALL LINKS FOR SCHOOL
// ========================
exports.getFormLinks = async (req, res) => {
    try {
        const { school_id } = req.params;

        if (!school_id) {
            return res.status(400).json({ success: false, message: 'School ID is required' });
        }

        const links = await FormLink.findAll({ where: { school_id } });
        res.json({ success: true, data: links });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ========================
// 4) GET FORM SUBMISSIONS (OPTIONAL)
// ========================
exports.getFormSubmissions = async (req, res) => {
    try {
        const { token } = req.params;

        const formLink = await FormLink.findOne({ where: { token } });
        if (!formLink) {
            return res.status(400).json({ success: false, message: 'Invalid form link' });
        }

        const submissions = await FormSubmission.findAll({
            where: { form_link_id: formLink.id },
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, data: submissions });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
