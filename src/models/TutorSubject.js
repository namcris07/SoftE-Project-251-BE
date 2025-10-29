import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TutorSubject = sequelize.define(
  "TutorSubject",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tutor_id: { type: DataTypes.INTEGER, allowNull: false },
    subject: { type: DataTypes.STRING(100), allowNull: false },
  },
  {
    tableName: "tutor_subjects",
    timestamps: false,
    underscored: true,
  }
);
