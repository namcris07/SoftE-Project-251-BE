
"use strict";

export async function up(queryInterface, Sequelize) {
  // Create tables matching schema.sql (simplified indices)
  const { INTEGER, TINYINT, STRING, TEXT, DATE, DATEONLY, ENUM, BIGINT, BOOLEAN, JSON } = Sequelize;

  await queryInterface.createTable("roles", {
    id: { type: TINYINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: STRING(32), allowNull: false, unique: true },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("departments", {
    id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: STRING(128), allowNull: false, unique: true },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("subjects", {
    id: { type: INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    code: { type: STRING(32), allowNull: false, unique: true },
    name: { type: STRING(128), allowNull: false },
    department_id: { type: INTEGER.UNSIGNED, allowNull: true,
      references: { model: "departments", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("users", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    sso_id: { type: STRING(64) },
    email: { type: STRING(191), allowNull: false, unique: true },
    full_name: { type: STRING(128), allowNull: false },
    role_id: { type: TINYINT.UNSIGNED, allowNull: false,
      references: { model: "roles", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
    department_id: { type: INTEGER.UNSIGNED, allowNull: true,
      references: { model: "departments", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    status: { type: ENUM("active","inactive","blocked"), defaultValue: "active" },
    external_source: { type: STRING(64) },
    external_id: { type: STRING(128) },
    last_synced_at: { type: DATE },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("tutor_profiles", {
    user_id: { type: BIGINT.UNSIGNED, primaryKey: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    specialization: { type: TEXT },
    bio: { type: TEXT },
    hourly_rate: { type: INTEGER.UNSIGNED },
    rating_avg: { type: Sequelize.DECIMAL(3,2), defaultValue: 0.0 },
    total_students: { type: INTEGER.UNSIGNED, defaultValue: 0 },
    completed_sessions: { type: INTEGER.UNSIGNED, defaultValue: 0 },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("student_profiles", {
    user_id: { type: BIGINT.UNSIGNED, primaryKey: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    student_code: { type: STRING(32) },
    program: { type: STRING(128) },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("availability_slots", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    tutor_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    weekday: { type: TINYINT.UNSIGNED, allowNull: false },
    start_time: { type: Sequelize.TIME, allowNull: false },
    end_time: { type: Sequelize.TIME, allowNull: false },
    is_recurring: { type: BOOLEAN, defaultValue: true },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("sessions", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    tutor_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    subject_id: { type: INTEGER.UNSIGNED, allowNull: true,
      references: { model: "subjects", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    start_at: { type: DATE, allowNull: false },
    end_at: { type: DATE, allowNull: false },
    location: { type: STRING(191) },
    status: { type: ENUM("pending","confirmed","completed","cancelled"), defaultValue: "pending" },
    price_per_hour: { type: INTEGER.UNSIGNED },
    total_price: { type: INTEGER.UNSIGNED },
    created_by_student_id: { type: BIGINT.UNSIGNED, allowNull: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("bookings", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    session_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "sessions", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    student_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    status: { type: ENUM("pending","confirmed","cancelled","completed"), defaultValue: "pending" },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
    unique_session_student: { type: STRING, allowNull: true } // placeholder to satisfy CLI diff tools
  });
  // add unique index
  await queryInterface.addConstraint("bookings", {
    fields: ["session_id", "student_id"],
    type: "unique",
    name: "uniq_session_student"
  });

  await queryInterface.createTable("payments", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    booking_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "bookings", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    amount: { type: INTEGER.UNSIGNED, allowNull: false },
    currency: { type: STRING(3), defaultValue: "VND" },
    method: { type: ENUM("cash","bank_transfer","card","momo","zalopay"), allowNull: false },
    status: { type: ENUM("pending","paid","failed","refunded"), defaultValue: "pending" },
    paid_at: { type: DATE },
    txn_ref: { type: STRING(128) },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("materials", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    tutor_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    title: { type: STRING(191), allowNull: false },
    type: { type: STRING(16), allowNull: false },
    size_bytes: { type: BIGINT.UNSIGNED },
    url: { type: STRING(512) },
    upload_date: { type: DATEONLY, allowNull: false },
    downloads: { type: INTEGER.UNSIGNED, defaultValue: 0 },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("feedbacks", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    session_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "sessions", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    student_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    tutor_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    rating: { type: TINYINT.UNSIGNED, allowNull: false },
    comment: { type: TEXT },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("notifications", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: BIGINT.UNSIGNED, allowNull: false,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "CASCADE" },
    title: { type: STRING(191), allowNull: false },
    body: { type: TEXT },
    is_read: { type: BOOLEAN, defaultValue: false },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("audit_logs", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    user_id: { type: BIGINT.UNSIGNED, allowNull: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    action: { type: STRING(128), allowNull: false },
    metadata: { type: JSON },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
  });

  await queryInterface.createTable("approvals", {
    id: { type: BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
    type: { type: STRING(64), allowNull: false },
    payload: { type: JSON, allowNull: false },
    status: { type: ENUM("pending","approved","rejected"), defaultValue: "pending" },
    submitted_by: { type: BIGINT.UNSIGNED, allowNull: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    reviewed_by: { type: BIGINT.UNSIGNED, allowNull: true,
      references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
    created_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
    updated_at: { type: DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP") },
  });

  // Seed roles
  await queryInterface.bulkInsert("roles", [
    { name: "student" }, { name: "tutor" }, { name: "admin" }
  ]);
}

export async function down(queryInterface) {
  const drop = (t)=> queryInterface.dropTable(t, { cascade: true }).catch(()=>{});
  await drop("approvals");
  await drop("audit_logs");
  await drop("notifications");
  await drop("feedbacks");
  await drop("materials");
  await drop("payments");
  await drop("bookings");
  await drop("sessions");
  await drop("availability_slots");
  await drop("student_profiles");
  await drop("tutor_profiles");
  await drop("users");
  await drop("subjects");
  await drop("departments");
  await drop("roles");
}
