// backend-superadmin/controllers/trustController.js
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/db');

// ---------------- Create Trust ----------------
const createTrust = async (req, res) => {
  try {
    const {
      trustName,
      registrationNumber,
      superAdminName,
      email,
      phone,
      address
    } = req.body;

    // ---- Validation ----
    if (!trustName || !registrationNumber || !superAdminName) {
      return res.status(400).json({
        success: false,
        message: 'Trust name, registration number, and super admin name are required'
      });
    }

    // ---- Insert Query ----
    const query = `
      INSERT INTO trusts 
      (trust_name, registration_number, super_admin_name, email, phone, address, created_at, updated_at)
      VALUES (:trust_name, :registration_number, :super_admin_name, :email, :phone, :address, NOW(), NOW())
      RETURNING *;
    `;

    const replacements = {
      trust_name: trustName,
      registration_number: registrationNumber,
      super_admin_name: superAdminName,
      email,
      phone,
      address
    };

    const [result] = await sequelize.query(query, {
      replacements,
      type: QueryTypes.INSERT
    });

    const insertedTrust = Array.isArray(result) ? result[0] : result;

    res.status(201).json({
      success: true,
      message: 'Trust created successfully',
      data: insertedTrust
    });

  } catch (err) {
    console.error('Create Trust Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Get All Trusts ----------------
const getAllTrusts = async (req, res) => {
  try {
    const query = `
      SELECT *
      FROM trusts
      ORDER BY id DESC;
    `;

    const trusts = await sequelize.query(query, { type: QueryTypes.SELECT });

    res.status(200).json({
      success: true,
      data: trusts
    });

  } catch (err) {
    console.error('Get All Trusts Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ---------------- Update Trust (PATCH) ----------------
const updateTrust = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      trustName,
      registrationNumber,
      superAdminName,
      email,
      phone,
      address
    } = req.body;

    // ---- Check if Trust Exists ----
    const existingTrust = await sequelize.query(
      `SELECT * FROM trusts WHERE id = :id`,
      { replacements: { id }, type: QueryTypes.SELECT }
    );

    if (!existingTrust || existingTrust.length === 0) {
      return res.status(404).json({ success: false, message: 'Trust not found' });
    }

    // ---- Build dynamic SET clause for partial updates ----
    const fields = {};
    if (trustName) fields.trust_name = trustName;
    if (registrationNumber) fields.registration_number = registrationNumber;
    if (superAdminName) fields.super_admin_name = superAdminName;
    if (email) fields.email = email;
    if (phone) fields.phone = phone;
    if (address) fields.address = address;

    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const setClause = Object.keys(fields)
      .map(key => `${key} = :${key}`)
      .join(', ');

    const query = `
      UPDATE trusts
      SET ${setClause}, updated_at = NOW()
      WHERE id = :id
      RETURNING *;
    `;

    const replacements = { ...fields, id };

    const updatedResult = await sequelize.query(query, {
      replacements,
      type: QueryTypes.UPDATE
    });

    const updatedTrust = Array.isArray(updatedResult) ? updatedResult[0] : updatedResult;

    res.status(200).json({
      success: true,
      message: 'Trust updated successfully',
      data: updatedTrust
    });

  } catch (err) {
    console.error('Update Trust Error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createTrust, getAllTrusts, updateTrust };
