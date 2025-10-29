import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Message = sequelize.define(
  "message",
  {
    student_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    tutor_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    sender_id: { type: DataTypes.BIGINT.UNSIGNED, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "messages",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);
