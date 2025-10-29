import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: "users", key: "id" },
  },
  tutor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: "users", key: "id" },
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  session_date: { // Ví dụ: 2025-01-08
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: { // Ví dụ: 14:00:00
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: { // Ví dụ: 16:00:00
    type: DataTypes.TIME,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  mode: {
    type: DataTypes.ENUM("online", "offline"),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
    defaultValue: "pending",
  },
  notes: {
    type: DataTypes.TEXT,
  },
  session_number: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
  total_sessions: {
    type: DataTypes.INTEGER.UNSIGNED,
  },
}, {
  timestamps: true,
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, 
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});