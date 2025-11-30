// backend/src/routes/session.routes.js
import express from "express";
import { auth } from "../middleware/auth.middleware.js";

// Import các controller cũ (nếu còn dùng)
import { getMySlots, createSlot, deleteSlot } from "../controllers/availability.controller.js";
import { createSession, searchTutors, updateSessionStatus } from "../controllers/session.controller.js";

// ✅ Import controller MỚI (Logic lớp học 12 buổi)
import { 
  getAllSessions, 
  getMySchedule 
} from "../controllers/courseController.js"; // Hãy chắc chắn file này tên là course.controller.js hay courseController.js

const router = express.Router();

// --- 1. API Lịch rảnh (Availability) ---
router.get("/availability", auth, getMySlots);
router.post("/availability", auth, createSlot);
router.delete("/availability/:id", auth, deleteSlot);

// --- 2. API Tìm kiếm Tutor ---
router.get("/tutors", auth, searchTutors);

// --- 3. API Lịch học/dạy (QUAN TRỌNG: Đặt lên đầu để ưu tiên) ---

// ✅ Cho Student xem lịch học (Sửa lỗi 404 tại đây)
router.get("/my-schedule", auth, getMySchedule);

// ✅ Cho Tutor xem lịch dạy
router.get("/", auth, getAllSessions); 

// --- 4. Các API thao tác khác ---
router.post("/", auth, createSession); // Đặt lịch lẻ (nếu còn dùng)
router.put("/:id/status", auth, updateSessionStatus);

export default router;