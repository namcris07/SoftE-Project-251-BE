import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TutorFeedback = sequelize.define(
  "TutorFeedback",
  {
    feedback_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    feedback_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "tutor_feedback",
    timestamps: false,
    underscored: true,
  }
);
