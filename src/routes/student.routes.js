import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import { getStudentProfile, updateStudentProfile, uploadStudentAvatar } from "../controllers/student.controller.js";
import { upload } from "../controllers/tutorProfile.controller.js"; // Reuse multer config from tutor

const router = express.Router();

// Get profile
router.get("/profile", auth, getStudentProfile);

// Update profile
router.put("/profile", auth, updateStudentProfile);

// Upload avatar
router.post("/avatar", auth, upload.single("avatar"), uploadStudentAvatar);

export default router;