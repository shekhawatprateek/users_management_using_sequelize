const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true, // They might not upload one immediately
    },
    role: {
      type: DataTypes.ENUM("user", "admin"), // For your Role-Based Access Control
      defaultValue: "admin",
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // Will turn true after email verification
    },
  },
  {
    timestamps: true,
  },
);

module.exports = User;