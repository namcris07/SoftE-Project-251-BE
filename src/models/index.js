import { DataTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { Course } from "./Course.js";
import { Enrollment } from "./Enrollment.js";
import { Notification } from "./Notification.js";

// ================================================================
// 1. ĐỊNH NGHĨA TOÀN BỘ MODELS (Tất cả ID đều là UNSIGNED)
// ================================================================

export const Role = sequelize.define("role", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(32), unique: true, allowNull: false },
}, { timestamps: false });

export const Department = sequelize.define("department", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(128), unique: true, allowNull: false },
}, { timestamps: false });

export const Subject = sequelize.define("subject", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  code: { type: DataTypes.STRING(32), unique: true, allowNull: false },
  name: { type: DataTypes.STRING(128), allowNull: false },
}, { timestamps: true, underscored: true });

export const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING(191), unique: true, allowNull: false },
  full_name: { type: DataTypes.STRING(128), allowNull: false },
  password: { type: DataTypes.STRING(191) },
  role_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Roles
  department_id: { type: DataTypes.INTEGER.UNSIGNED }, // FK -> Departments
  sso_id: { type: DataTypes.STRING(64) },
  avatar_url: { type: DataTypes.STRING(512) },
  status: { type: DataTypes.ENUM("active", "inactive", "blocked"), defaultValue: "active" },
}, { underscored: true });

export const Tutor = sequelize.define("tutor", {
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true }, // FK -> Users
  name: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false },
  phone: { type: DataTypes.STRING(20) },
  department: { type: DataTypes.STRING(100) },
  specialization: { type: DataTypes.TEXT },
  experience_years: { type: DataTypes.STRING(20) },
  education: { type: DataTypes.STRING(255) },
  bio: { type: DataTypes.TEXT },
  avatar_url: { type: DataTypes.STRING(255) },
  hourly_rate: { type: DataTypes.INTEGER.UNSIGNED },
  rating_avg: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.0 },
  total_students: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  completed_sessions: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
}, { underscored: true });

export const Student = sequelize.define("student", {
  student_id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, unique: true }, // FK -> Users
  mssv: { type: DataTypes.STRING(20) },
  phone: { type: DataTypes.STRING(20) },
  faculty: { type: DataTypes.STRING(100) },
  major: { type: DataTypes.STRING(100) },
  enrollment_year: { type: DataTypes.STRING(4) },
  address: { type: DataTypes.STRING(255) },
  bio: { type: DataTypes.TEXT },
  avatar_url: { type: DataTypes.STRING(255) },
  total_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
  completed_sessions: { type: DataTypes.INTEGER, defaultValue: 0 },
  training_points: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { underscored: true });

export const TutorSubject = sequelize.define("tutor_subject", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Tutors
  subject: { type: DataTypes.STRING(100), allowNull: false },
}, { timestamps: false, underscored: true });

export const AvailabilitySlot = sequelize.define("availability_slot", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Users (Tutor)
  weekday: { type: DataTypes.TINYINT, allowNull: false },
  start_time: { type: DataTypes.TIME, allowNull: false },
  end_time: { type: DataTypes.TIME, allowNull: false },
  is_recurring: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { underscored: true });

export const Session = sequelize.define("session", {
  id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    primaryKey: true, 
    autoIncrement: true 
  },
  tutor_id: { 
    type: DataTypes.INTEGER.UNSIGNED, 
    allowNull: false 
  }, // FK -> Users

  // ✅ THÊM MỚI: Liên kết với bảng Courses
  course_id: { 
    type: DataTypes.UUID, // UUID (Khớp với id của Course)
    allowNull: true 
  }, 

  // ✅ THÊM MỚI: Tiêu đề buổi học (VD: "Buổi 1: Đạo hàm")
  title: { 
    type: DataTypes.STRING 
  },

  subject_id: { type: DataTypes.INTEGER.UNSIGNED }, // (Giữ lại cho logic cũ nếu cần)
  created_by_student_id: { type: DataTypes.INTEGER.UNSIGNED }, // (Giữ lại cho logic cũ)
  
  start_at: { type: DataTypes.DATE, allowNull: false },
  end_at: { type: DataTypes.DATE, allowNull: false },
  location: { type: DataTypes.STRING(191) },
  
  // ✅ THÊM MỚI: Ghi chú (Lý do dời lịch...)
  note: { 
    type: DataTypes.TEXT 
  },
  is_reminder_sent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  // ⚠️ QUAN TRỌNG: CẬP NHẬT ENUM ĐỂ KHÔNG BỊ LỖI
  status: { 
    type: DataTypes.ENUM(
      "pending", 
      "confirmed", 
      "completed", 
      "cancelled", 
      "upcoming",    // <-- Cần cái này cho Lớp học
      "rescheduled"  // <-- Cần cái này cho Dời lịch
    ), 
    defaultValue: "upcoming" // Đổi mặc định thành upcoming cho lớp học
  },
}, { 
  underscored: true,
  timestamps: true 
});

export const Booking = sequelize.define("booking", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Users
  session_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Sessions
  status: { type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"), defaultValue: "pending" },
}, { underscored: true });

export const Payment = sequelize.define("payment", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  booking_id: { type: DataTypes.INTEGER.UNSIGNED }, // FK -> Bookings
  amount: { type: DataTypes.INTEGER, allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: "VND" },
  method: { type: DataTypes.ENUM("cash","bank_transfer","card","momo","zalopay"), allowNull: false },
  status: { type: DataTypes.ENUM("pending","paid","failed","refunded"), defaultValue: "pending" },
  paid_at: { type: DataTypes.DATE },
  txn_ref: { type: DataTypes.STRING(128) },
}, { underscored: true });

export const Feedback = sequelize.define("feedback", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Users
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> Users
  session_id: { type: DataTypes.INTEGER.UNSIGNED }, // FK -> Sessions
  rating: { type: DataTypes.TINYINT, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  student_name: { type: DataTypes.STRING }, 
  subject: { type: DataTypes.STRING },
  feedback_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { underscored: true });

export const AuditLog = sequelize.define("audit_log", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // FK -> Users
  action: { type: DataTypes.STRING(128), allowNull: false },
  metadata: { type: DataTypes.JSON },
}, { underscored: true });

export const Approval = sequelize.define("approval", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  submitted_by: { type: DataTypes.INTEGER.UNSIGNED }, // FK -> Users
  reviewed_by: { type: DataTypes.INTEGER.UNSIGNED },  // FK -> Users
  type: { type: DataTypes.STRING(64), allowNull: false },
  payload: { type: DataTypes.JSON, allowNull: false },
  status: { type: DataTypes.ENUM("pending","approved","rejected"), defaultValue: "pending" },
}, { underscored: true });

// --- 4 Bảng mới thêm/sửa ---

export const Document = sequelize.define("document", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },

  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },

  // ✅ BẮT BUỘC PHẢI CÓ
  course_id: { type: DataTypes.CHAR(36), allowNull: true },

  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  file_path: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("pdf", "doc", "docx", "ppt", "video", "image"), defaultValue: "pdf" },
  category: { type: DataTypes.ENUM("lecture", "exercise", "exam", "reference"), defaultValue: "lecture" },
  size: { type: DataTypes.STRING },
  downloads: { type: DataTypes.INTEGER, defaultValue: 0 },
  access: { type: DataTypes.ENUM("public", "private"), defaultValue: "public" },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
  author: { type: DataTypes.STRING },

  // ✅ BẮT BUỘC PHẢI CÓ
  upload_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  file_type: { type: DataTypes.VIRTUAL, get() { return this.type; } },
  file_size_mb: { type: DataTypes.VIRTUAL, get() { return 0; } },

}, { underscored: true });

export const Assignment = sequelize.define("assignment", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // ✅ QUAN TRỌNG: UNSIGNED
  course_id: { type: DataTypes.UUID, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('file_upload', 'quiz'), defaultValue: 'file_upload' },
  deadline: { type: DataTypes.DATE },
  attachment_url: { type: DataTypes.STRING },
}, { underscored: true });

export const AssignmentSubmission = sequelize.define("assignment_submission", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  assignment_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // ✅ FK -> Assignment
  student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // ✅ FK -> User
  file_url: { type: DataTypes.STRING },
  content: { type: DataTypes.TEXT },
  submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  score: { type: DataTypes.FLOAT },
  feedback: { type: DataTypes.TEXT },
  graded_at: { type: DataTypes.DATE },
}, { underscored: true });
export const SessionReport = sequelize.define("session_report", {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  
  // Khóa ngoại
  course_id: { type: DataTypes.UUID, allowNull: false }, // UUID để khớp với Course
  session_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true }, // Có thể null nếu report chung chung
  student_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false }, // FK -> User (Học sinh)
  tutor_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },   // FK -> User (Gia sư)

  // Nội dung đánh giá
  topics_covered: { type: DataTypes.JSON }, // Lưu mảng các chủ đề: ["React", "State"]
  comprehension_level: { 
    type: DataTypes.ENUM("excellent", "good", "fair", "poor"), 
    defaultValue: "good" 
  },
  progress_notes: { type: DataTypes.TEXT }, // Nhận xét chi tiết
  strengths: { type: DataTypes.JSON }, // Điểm mạnh
  areas_for_improvement: { type: DataTypes.JSON }, // Điểm cần cải thiện
  next_session_goals: { type: DataTypes.JSON }, // Mục tiêu buổi sau

  // Chữ ký điện tử (nếu cần)
  tutor_signature: { type: DataTypes.STRING },
  tutor_signed_at: { type: DataTypes.DATE },
  student_signature: { type: DataTypes.STRING },
  student_signed_at: { type: DataTypes.DATE },

}, { underscored: true, timestamps: true });

// ================================================================
// 2. THIẾT LẬP QUAN HỆ (ASSOCIATIONS) - ON DELETE CASCADE TOÀN BỘ
// ================================================================

// Role & Department
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

Department.hasMany(User, { foreignKey: "department_id" });
User.belongsTo(Department, { foreignKey: "department_id" });

Department.hasMany(Subject, { foreignKey: "department_id" });
Subject.belongsTo(Department, { foreignKey: "department_id" });

// Tutor & Student
User.hasOne(Tutor, { foreignKey: "user_id", as: "tutorProfile", onDelete: "CASCADE" });
Tutor.belongsTo(User, { foreignKey: "user_id", as: "user" });

User.hasOne(Student, { foreignKey: "user_id", as: "studentProfile", onDelete: "CASCADE" });
Student.belongsTo(User, { foreignKey: "user_id", as: "user" });

// TutorSubject
Tutor.hasMany(TutorSubject, { foreignKey: "tutor_id", onDelete: "CASCADE" });
TutorSubject.belongsTo(Tutor, { foreignKey: "tutor_id" });

// Availability
User.hasMany(AvailabilitySlot, { foreignKey: "tutor_id", onDelete: "CASCADE" });
AvailabilitySlot.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });
Tutor.hasMany(AvailabilitySlot, { foreignKey: "tutor_id" }); // Alias

// Sessions
User.hasMany(Session, { foreignKey: "tutor_id", onDelete: "CASCADE" });
Session.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });

Subject.hasMany(Session, { foreignKey: "subject_id" });
Session.belongsTo(Subject, { foreignKey: "subject_id" });

User.hasMany(Session, { foreignKey: "created_by_student_id" });
Session.belongsTo(User, { as: "created_by_student", foreignKey: "created_by_student_id" });

// Booking
Session.hasMany(Booking, { foreignKey: "session_id", onDelete: "CASCADE" });
Booking.belongsTo(Session, { foreignKey: "session_id" });

User.hasMany(Booking, { foreignKey: "student_id", onDelete: "CASCADE" });
Booking.belongsTo(User, { as: "student", foreignKey: "student_id" });
Course.hasMany(Assignment, { foreignKey: "course_id", as: "course_assignments", onDelete: "CASCADE" });
Assignment.belongsTo(Course, { foreignKey: "course_id", as: "course" });
// Payment
Booking.hasMany(Payment, { foreignKey: "booking_id", onDelete: "SET NULL" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

// Feedback
Session.hasMany(Feedback, { foreignKey: "session_id", onDelete: "SET NULL" });
Feedback.belongsTo(Session, { foreignKey: "session_id" });

User.hasMany(Feedback, { foreignKey: "student_id", onDelete: "CASCADE" });
Feedback.belongsTo(User, { as: "student", foreignKey: "student_id" });

User.hasMany(Feedback, { foreignKey: "tutor_id", onDelete: "CASCADE" });
Feedback.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });
Tutor.hasMany(Feedback, { foreignKey: "tutor_id" }); 


User.hasMany(AuditLog, { foreignKey: "user_id", onDelete: "SET NULL" });
AuditLog.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Approval, { foreignKey: "submitted_by", onDelete: "SET NULL" });
User.hasMany(Approval, { foreignKey: "reviewed_by", onDelete: "SET NULL" });

// Documents
User.hasMany(Document, { foreignKey: "tutor_id", onDelete: "CASCADE" });
Document.belongsTo(User, { as: "tutor", foreignKey: "tutor_id" });
Tutor.hasMany(Document, { foreignKey: "tutor_id" }); 

// Assignments
User.hasMany(Assignment, { foreignKey: "tutor_id", as: "assignments", onDelete: "CASCADE" });
Assignment.belongsTo(User, { foreignKey: "tutor_id", as: "tutor" });

Assignment.hasMany(AssignmentSubmission, { foreignKey: "assignment_id", as: "submissions", onDelete: "CASCADE" });
AssignmentSubmission.belongsTo(Assignment, { foreignKey: "assignment_id", as: "assignment" });

User.hasMany(AssignmentSubmission, { foreignKey: "student_id", as: "my_submissions", onDelete: "CASCADE" });
AssignmentSubmission.belongsTo(User, { foreignKey: "student_id", as: "student" });
// 1. Quan hệ User (Tutor) - Course
User.hasMany(Course, { foreignKey: "tutor_id", as: "teaching_courses" });
Course.belongsTo(User, { foreignKey: "tutor_id", as: "tutor" });

// 2. Quan hệ Course - Session (1 Lớp có nhiều Buổi)
Course.hasMany(Session, { foreignKey: "course_id", as: "sessions", onDelete: "CASCADE" });
Session.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// 3. Quan hệ Student - Course (Thông qua Enrollment)
User.belongsToMany(Course, { through: Enrollment, foreignKey: "student_id", as: "enrolled_courses" });
Course.belongsToMany(User, { through: Enrollment, foreignKey: "course_id", as: "students" });

User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });
Course.hasMany(Document, { foreignKey: "course_id", as: "documents" });
Document.belongsTo(Course, { foreignKey: "course_id" });

// --- Quan hệ cho SessionReport ---

// 1. Course - Reports
Course.hasMany(SessionReport, { foreignKey: "course_id", as: "reports", onDelete: "CASCADE" });
SessionReport.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// 2. Session - Reports
Session.hasMany(SessionReport, { foreignKey: "session_id", as: "reports", onDelete: "SET NULL" });
SessionReport.belongsTo(Session, { foreignKey: "session_id", as: "session" });

// 3. User (Student) - Reports
User.hasMany(SessionReport, { foreignKey: "student_id", as: "student_reports", onDelete: "CASCADE" });
SessionReport.belongsTo(User, { foreignKey: "student_id", as: "student" });

// 4. User (Tutor) - Reports
User.hasMany(SessionReport, { foreignKey: "tutor_id", as: "tutor_reports", onDelete: "CASCADE" });
SessionReport.belongsTo(User, { foreignKey: "tutor_id", as: "tutor" });
// ================================================================
// 3. EXPORT
// ================================================================
export {
  sequelize,
  // Alias cho code cũ
  AvailabilitySlot as TutorAvailability, 
  Document as TutorMaterial, 
  Feedback as TutorFeedback,
  Notification
};
export {Course, Enrollment};