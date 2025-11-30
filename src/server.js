import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import fs from "fs";
import { sequelize } from "./config/database.js";

// Import Models
import "./models/index.js";
import { Role, User ,Tutor, Student} from "./models/index.js";
import courseRoutes from "./routes/course.routes.js";
// Import Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import documentRoutes from "./routes/documentRoutes.js";
import tutorProfileRoutes from "./routes/tutorProfile.routes.js";
import studentRoutes from "./routes/student.routes.js";
import { startReminderJob } from "./cron/reminder.job.js";
import { getNotifications, markAsRead, deleteNotification } from "./controllers/notification.controller.js";
import { auth } from "./middleware/auth.middleware.js";
import swaggerUi from "swagger-ui-express";
import swaggerFile from './config/swagger-output.json' with { type: 'json' };
import path from "path";
import { fileURLToPath } from "url";
const app = express();

// 1. Cấu hình CORS (Chỉ giữ 1 cái chuẩn nhất cho FE)
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// 2. Cấu hình đường dẫn tĩnh (Uploads)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
// ✅ Tạo biến __dirname vì đang dùng ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Tạo thư mục uploads nếu chưa có
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve file tĩnh
app.use("/uploads", express.static(uploadDir));

// 3. Routes
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tutor", tutorProfileRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/courses", courseRoutes);  
const notifRouter = express.Router();
notifRouter.get("/", auth, getNotifications);
notifRouter.put("/:id/read", auth, markAsRead);
notifRouter.delete("/:id", auth, deleteNotification);
app.use("/api/notifications", notifRouter); // -> Sẽ gọi vào courseController
// 4. Hàm Seed User Mặc định
async function seedUsers() {
  try {
    const count = await User.count();
    if (count === 0) {
      console.log("🌱 Seeding default users...");
      
      const roles = ["admin", "tutor", "student"];
      for (const r of roles) {
        await Role.findOrCreate({ where: { name: r } });
      }

      const adminRole = await Role.findOne({ where: { name: "admin" } });
      const tutorRole = await Role.findOne({ where: { name: "tutor" } });
      const studentRole = await Role.findOne({ where: { name: "student" } });

      // 1. Tạo Admin
      await User.create({
        full_name: "System Admin",
        email: "admin@hcmut.edu.vn",
        password: await bcrypt.hash("admin123", 10),
        role_id: adminRole.id,
      });

      // 2. Tạo Tutor User + Tutor Profile
      const tutorUser = await User.create({
        full_name: "Tutor Example",
        email: "tutor@hcmut.edu.vn",
        password: await bcrypt.hash("tutor123", 10),
        role_id: tutorRole.id,
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
      });

      // ✅ QUAN TRỌNG: Tạo hồ sơ Tutor để Student tìm thấy
      await Tutor.create({
        user_id: tutorUser.id,
        name: tutorUser.full_name,
        email: tutorUser.email,
        experience_years: "5 năm",
        hourly_rate: 200000,
        rating_avg: 4.8,
        total_students: 10,
        completed_sessions: 50,
        department: "Khoa Khoa học máy tính",
        specialization: "Lập trình Web, AI",
        bio: "Giảng viên nhiệt tình, có kinh nghiệm thực chiến."
      });

      // 3. Tạo Student User + Student Profile
      const studentUser = await User.create({
        full_name: "Student Example",
        email: "student@hcmut.edu.vn",
        password: await bcrypt.hash("student123", 10),
        role_id: studentRole.id,
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka"
      });

      await Student.create({
        user_id: studentUser.id,
        mssv: "2010001",
        faculty: "Khoa học máy tính",
        major: "Kỹ thuật phần mềm"
      });

      console.log("✅ Seeded default users & profiles success");
    }
  } catch (err) {
    console.error("⚠️ Seed error:", err.message);
  }
}

// 5. Khởi động Server & Kết nối DB
const port = process.env.PORT || 3000;

sequelize
  // ⚠️ Đổi thành force: true để xóa sạch bảng và tạo lại từ đầu
  .sync({ force: true }) 
  .then(async () => {  
    await seedUsers(); // Hàm này sẽ tạo Admin (ID 1), Tutor (ID 2), Student (ID 3)
      startReminderJob();
    app.listen(port, () =>
      console.log(`🚀 Server listening on http://localhost:${port}`)
    );
  })
  .catch((e) => {
    console.error("❌ DB connect error:", e);
    process.exit(1);
  });