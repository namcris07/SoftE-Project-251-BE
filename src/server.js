import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { sequelize } from "./config/database.js";
import "./models/index.js";
import { Role, User } from "./models/index.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";

// ✅ Tạo app TRƯỚC khi dùng app.use()
const app = express();
// ✅ Cho phép frontend truy cập
app.use(cors({
  origin: ["https://softe-project-client.vercel.app"], // domain frontend
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// ✅ Các route chính
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes); // ✅ Di chuyển xuống dưới

// ✅ Seed dữ liệu người dùng mặc định
async function seedUsers() {
  const count = await User.count();
  if (count === 0) {
    const adminRole = await Role.findOne({ where: { name: "admin" } });
    const tutorRole = await Role.findOne({ where: { name: "tutor" } });
    const studentRole = await Role.findOne({ where: { name: "student" } });

    await User.create({
      full_name: "System Admin",
      email: "admin@hcmut.edu.vn",
      password: await bcrypt.hash("admin123", 10),
      role_id: adminRole.id,
    });
    await User.create({
      full_name: "Tutor Example",
      email: "tutor@hcmut.edu.vn",
      password: await bcrypt.hash("tutor123", 10),
      role_id: tutorRole.id,
    });
    await User.create({
      full_name: "Student Example",
      email: "student@hcmut.edu.vn",
      password: await bcrypt.hash("student123", 10),
      role_id: studentRole.id,
    });
    console.log("✅ Seeded default users");
  }
}

// ✅ Kết nối DB & khởi chạy server
const port = process.env.PORT || 3000;
sequelize
  .authenticate()
  .then(async () => {
    console.log("DB connected");
    await seedUsers();
    app.listen(port, () =>
      console.log(`✅ Server listening on http://localhost:${port}`)
    );
  })
  .catch((e) => {
    console.error("❌ DB connect error:", e);
    process.exit(1);
  });
