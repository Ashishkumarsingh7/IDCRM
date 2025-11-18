// backend-school/controllers/formLinkController.js
const FormLink = require('../models/FormLink');
const crypto = require('crypto');

// Generate a unique token
const generateToken = () => crypto.randomBytes(16).toString('hex');

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
            link: `https://yourfrontend.com/student-form/${token}`,
            data: link
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Fetch all links for a school
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
