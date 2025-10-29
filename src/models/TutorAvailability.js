import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TutorAvailability = sequelize.define(
  "TutorAvailability",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tutor_id: { type: DataTypes.INTEGER, allowNull: false },
    weekday: { type: DataTypes.STRING(20), allowNull: false }, // Ví dụ: "Thứ 2"
    start_time: { type: DataTypes.TIME, allowNull: false },
    end_time: { type: DataTypes.TIME, allowNull: false },
  },
  {
    tableName: "tutor_availability",
    timestamps: false,
    underscored: true,
  }
);
