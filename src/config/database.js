import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DB_NAME || "tutor_ss",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
    define: { underscored: true, freezeTableName: false, timestamps: false },
  }
);
