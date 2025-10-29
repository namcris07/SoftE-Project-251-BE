// backend/src/models/document.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  author: {
    type: DataTypes.STRING,
    allowNull: true, // ✅ để tránh lỗi khi tutorId không gửi tên
  },

  tutor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM("pdf", "doc", "docx", "ppt", "video", "image"),
    defaultValue: "pdf",
  },

  category: {
    type: DataTypes.ENUM("lecture", "exercise", "exam", "reference"),
    defaultValue: "lecture",
  },

  size: {
    type: DataTypes.STRING,
  },

  upload_date: {
    type: DataTypes.DATE,
    field: "upload_date", // ✅ ánh xạ đúng cột
    defaultValue: DataTypes.NOW,
  },

  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },

  access: {
    type: DataTypes.ENUM("public", "private"),
    defaultValue: "public",
  },

  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending", // ✅ mặc định pending, admin mới duyệt sau
  },
});
