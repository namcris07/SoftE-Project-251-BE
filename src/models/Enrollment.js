// models/Enrollment.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Enrollment = sequelize.define("Enrollment", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "active", "rejected", "dropped","waitlist"),
    defaultValue: "pending",
  },
  enrolled_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
});