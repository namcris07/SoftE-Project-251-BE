import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Course = sequelize.define("Course", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tutor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  max_students: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
  },
  current_students: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  schedule_text: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  duration: { // Thêm trường này nếu DB có
    type: DataTypes.INTEGER,
    defaultValue: 90,
  },
  require_approval: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  status: {
    // ✅ SỬA LẠI CHO KHỚP VỚI DB ENUM
    type: DataTypes.ENUM("open", "closed", "finished"),
    defaultValue: "open", 
  }
});