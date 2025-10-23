import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";

export const Role = sequelize.define("role", {
  name: { type: DataTypes.STRING(32), unique: true, allowNull: false },
});

export const Department = sequelize.define("department", {
  name: { type: DataTypes.STRING(128), unique: true, allowNull: false },
});

export const Subject = sequelize.define("subject", {
  code: { type: DataTypes.STRING(32), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(128), allowNull: false },
});

export const User = sequelize.define(
  "user",
  {
    sso_id: { type: DataTypes.STRING(64) },
    email: { type: DataTypes.STRING(191), unique: true, allowNull: false },
    full_name: { type: DataTypes.STRING(128), allowNull: false },
    password: { type: DataTypes.STRING(191) },
    status: { type: DataTypes.ENUM("active", "inactive", "blocked"), defaultValue: "active" },
    external_source: { type: DataTypes.STRING(64) },
    external_id: { type: DataTypes.STRING(128) },
    last_synced_at: { type: DataTypes.DATE },
  },
  {
    timestamps: true, // ✅ bật timestamp
    underscored: true, // ✅ ánh xạ createdAt -> created_at
  }
);


export const TutorProfile = sequelize.define("tutor_profile", {
  specialization: { type: DataTypes.TEXT },
  bio: { type: DataTypes.TEXT },
  hourly_rate: { type: DataTypes.INTEGER },
  rating_avg: { type: DataTypes.DECIMAL(3,2), defaultValue: 0.0 },
  total_students: { type: DataTypes.INTEGER, defaultValue: 0 },
  completed_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export const StudentProfile = sequelize.define("student_profile", {
  student_code: { type: DataTypes.STRING(32) },
  program: { type: DataTypes.STRING(128) },
});

export const AvailabilitySlot = sequelize.define("availability_slot", {
  weekday: { type: DataTypes.TINYINT, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  is_recurring: { type: DataTypes.BOOLEAN, defaultValue: true },
});

export const Session = sequelize.define("session", {
  start_at: { type: DataTypes.DATE, allowNull: false },
  end_at: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING(191) },
  status: { type: DataTypes.ENUM("pending","confirmed","completed","cancelled"), defaultValue: "pending" },
  price_per_hour: { type: DataTypes.INTEGER },
  total_price: { type: DataTypes.INTEGER },
});

export const Booking = sequelize.define("booking", {
  status: { type: DataTypes.ENUM("pending","confirmed","cancelled","completed"), defaultValue: "pending" },
});

export const Payment = sequelize.define("payment", {
  amount: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: "VND" },
  method: { type: DataTypes.ENUM("cash","bank_transfer","card","momo","zalopay"), allowNull: false },
  status: { type: DataTypes.ENUM("pending","paid","failed","refunded"), defaultValue: "pending" },
  paid_at: { type: DataTypes.DATE },
  txn_ref: { type: DataTypes.STRING(128) },
});

export const Material = sequelize.define("material", {
  title: { type: DataTypes.STRING(191), allowNull: false },
  type: { type: DataTypes.STRING(16), allowNull: false },
  size_bytes: { type: DataTypes.BIGINT },
  url: { type: DataTypes.STRING(512) },
  upload_date: { type: DataTypes.DATEONLY, allowNull: false },
  downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
});

export const Feedback = sequelize.define("feedback", {
  rating: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
});

export const Notification = sequelize.define("notification", {
  title: { type: DataTypes.STRING(191), allowNull: false },
  body: { type: DataTypes.TEXT },
  is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
});

export const AuditLog = sequelize.define("audit_log", {
  action: { type: DataTypes.STRING(128), allowNull: false },
  metadata: { type: DataTypes.JSON },
});

export const Approval = sequelize.define("approval", {
  type: { type: DataTypes.STRING(64), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.ENUM("pending","approved","rejected"), defaultValue: "pending" },
});

// Associations
Role.hasMany(User); User.belongsTo(Role);
Department.hasMany(User); User.belongsTo(Department);
Department.hasMany(Subject); Subject.belongsTo(Department);
// Role.hasMany(User); User.belongsTo(Role);
Role.hasMany(User, { foreignKey: { name: "role_id", allowNull: false } });
User.belongsTo(Role, { foreignKey: { name: "role_id", allowNull: false } });

User.hasOne(TutorProfile, { foreignKey: { name: "user_id", allowNull: false }, onDelete: "CASCADE" });
TutorProfile.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(StudentProfile, { foreignKey: { name: "user_id", allowNull: false }, onDelete: "CASCADE" });
StudentProfile.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(AvailabilitySlot, { foreignKey: { name: "tutor_id", allowNull: false }, onDelete: "CASCADE" });
AvailabilitySlot.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });

User.hasMany(Material, { foreignKey: { name: "tutor_id", allowNull: false }, onDelete: "CASCADE" });
Material.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });

User.hasMany(Session, { foreignKey: { name: "tutor_id", allowNull: false }, onDelete: "CASCADE" });
Session.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });
Subject.hasMany(Session); Session.belongsTo(Subject);
User.hasMany(Session, { foreignKey: { name: "created_by_student_id" } });
Session.belongsTo(User, { as: "created_by_student", foreignKey: "created_by_student_id" });

Session.hasMany(Booking); Booking.belongsTo(Session);
User.hasMany(Booking, { foreignKey: { name: "student_id", allowNull: false }, onDelete: "CASCADE" });
Booking.belongsTo(User, { as: "student", foreignKey: "student_id" });

Booking.hasMany(Payment); Payment.belongsTo(Booking);

Session.hasMany(Feedback); Feedback.belongsTo(Session);
User.hasMany(Feedback, { foreignKey: { name: "student_id", allowNull: false }, onDelete: "CASCADE" });
Feedback.belongsTo(User, { as: "student", foreignKey: "student_id" });
User.hasMany(Feedback, { foreignKey: { name: "tutor_id", allowNull: false }, onDelete: "CASCADE" });
Feedback.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });

User.hasMany(Notification); Notification.belongsTo(User);
User.hasMany(AuditLog); AuditLog.belongsTo(User);

User.hasMany(Approval, { foreignKey: "submitted_by" });
User.hasMany(Approval, { foreignKey: "reviewed_by" });
