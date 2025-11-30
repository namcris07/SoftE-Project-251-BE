import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("schedule", "approval", "registration", "document", "system"),
    defaultValue: "system",
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // Lưu thêm dữ liệu để khi click vào thông báo sẽ chuyển hướng đúng chỗ (VD: courseId)
  data: {
    type: DataTypes.JSON, 
    allowNull: true,
  }
}, {
  underscored: true,
  timestamps: true,
});