import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Availability = sequelize.define("Availability", {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  tutor_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: { model: "users", key: "id" },
  },
  available_date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  is_booked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  }
});