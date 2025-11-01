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
import messageRoutes from "./routes/message.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import documentRoutes from "./routes/documentRoutes.js";
import tutorProfileRoutes from "./routes/tutorProfile.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerFile from './config/swagger-output.json' with { type: 'json' };
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
// ✅ Tạo biến __dirname vì đang dùng ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Routes
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);              // ✅ có /api/users
app.use("/api/sessions", sessionRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/tutor", tutorProfileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
// Routes
app.get("/health", (_req, res) => res.json({ ok: true }));
// Seed mẫu
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
      role_id: adminRole.id,   // ✅ đúng cột role_id
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
