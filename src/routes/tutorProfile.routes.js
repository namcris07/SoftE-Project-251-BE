import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  upload,
  uploadTutorAvatar,
  getTutorProfileView,
  updateTutorProfile,
} from "../controllers/tutorProfile.controller.js";

const router = express.Router();

// ✅ SỬA: Gọi hàm từ controller, không viết inline
router.get("/:id/view", getTutorProfileView);

// Các route khác giữ nguyên
router.put("/update-profile", auth, updateTutorProfile);
router.post("/upload-avatar", auth, upload.single("avatar"), uploadTutorAvatar);

export default router;