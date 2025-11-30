import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Tutor = sequelize.define(
  "Tutor",
  {
    tutor_id: { 
      type: DataTypes.INTEGER.UNSIGNED, // ✅ Thêm .UNSIGNED
      primaryKey: true,
      autoIncrement: true 
    },
    user_id: {
        type: DataTypes.INTEGER.UNSIGNED, // ✅ QUAN TRỌNG: Phải khớp với users.id
        allowNull: false, // Nên là false vì Tutor phải gắn với User
        unique: true
    },
    // ... các trường khác giữ nguyên
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    // ...
  },
  {
    tableName: "tutors",
    timestamps: true,
    underscored: true,
  }
);