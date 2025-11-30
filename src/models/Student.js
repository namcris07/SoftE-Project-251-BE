import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Student = sequelize.define(
  "Student",
  {
    student_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ Thêm .UNSIGNED
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED, // ✅ QUAN TRỌNG: Phải khớp với users.id
      allowNull: false,
      unique: true,
    },
    mssv: { type: DataTypes.STRING(20) },
    phone: { type: DataTypes.STRING(20) },
    faculty: { type: DataTypes.STRING(100) },
    major: { type: DataTypes.STRING(100) },
    enrollment_year: { type: DataTypes.STRING(4) },
    address: { type: DataTypes.STRING(255) },
    bio: { type: DataTypes.TEXT },
    avatar_url: { type: DataTypes.STRING(255) },
    total_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
    training_points: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "students",
    timestamps: true,
    underscored: true,
  }
);