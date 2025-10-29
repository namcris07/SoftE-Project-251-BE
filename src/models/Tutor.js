import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Tutor = sequelize.define(
  "Tutor",
  {
    tutor_id: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true 
    },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    phone: { type: DataTypes.STRING(20) },
    department: { type: DataTypes.STRING(100) },
    specialization: { type: DataTypes.TEXT },
    experience_years: {
  type: DataTypes.STRING(20), // có thể tăng lên 20 nếu bạn muốn lưu "10 năm kinh nghiệm" hoặc "Trên 5 năm"
  allowNull: true,
  field: 'experience_years'
},
    education: { type: DataTypes.STRING(255) },
    bio: { type: DataTypes.TEXT },
    avatar_url: { type: DataTypes.STRING(255), allowNull: true },
    hourlyRate: { type: DataTypes.INTEGER , field: 'hourly_rate' },
    rating_avg: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
    total_students: { type: DataTypes.INTEGER, defaultValue: 0 },
    completed_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    tableName: "tutors",
    timestamps: true,
    underscored: true,
  }
);