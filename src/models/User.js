import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const User = sequelize.define(
  "User",
  {
    // 🔑 QUAN TRỌNG: Phải là UNSIGNED để làm cha của Tutor/Student
    id: {
      type: DataTypes.INTEGER.UNSIGNED, 
      primaryKey: true,
      autoIncrement: true,
    },
    email: { 
      type: DataTypes.STRING(191), 
      unique: true, 
      allowNull: false 
    },
    full_name: { 
      type: DataTypes.STRING(128), 
      allowNull: false 
    },
    password: { 
      type: DataTypes.STRING(191) 
    },
    role_id: {
      type: DataTypes.INTEGER.UNSIGNED, // Khớp với id của bảng Roles
      allowNull: false,
    },
    sso_id: { type: DataTypes.STRING(64) },
    avatar_url: { type: DataTypes.STRING(512) },
    status: { 
      type: DataTypes.ENUM("active", "inactive", "blocked"), 
      defaultValue: "active" 
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true, // createdAt -> created_at
  }
);