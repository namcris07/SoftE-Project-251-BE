import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const TutorMaterial = sequelize.define(
  "TutorMaterial",
  {
    material_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tutor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_type: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    file_size_mb: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    upload_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    downloads: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "tutor_materials",
    timestamps: false,
    underscored: true,
  }
);
