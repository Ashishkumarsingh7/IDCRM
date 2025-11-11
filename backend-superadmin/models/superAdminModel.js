const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');
const bcrypt = require('bcryptjs');

const SuperAdmin = sequelize.define('SuperAdmin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'super_admins',
  timestamps: true,
});

SuperAdmin.beforeCreate(async (admin) => {
  admin.password = await bcrypt.hash(admin.password, 10);
});

module.exports = SuperAdmin;
