// backend-school/models/FormLink.js
const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db'); // your Sequelize instance

const FormLink = sequelize.define('FormLink', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    token: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    school_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    class_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    division: {
        type: DataTypes.STRING,
    },
    expires_at: {
        type: DataTypes.DATE,
    },
}, {
    tableName: 'form_links',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
});

module.exports = FormLink;
