import express from "express";
import { auth } from "../middleware/auth.middleware.js";
import {
  upload,
  uploadTutorAvatar,
  getTutorProfileView,
  updateTutorProfile,
} from "../controllers/tutorProfile.controller.js";
import { Tutor } from "../models/index.js";

const router = express.Router();

router.get("/:id/view", async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ where: { user_id: req.params.id } });
    if (!tutor)
      return res.status(404).json({ error: "Tutor not found" });

    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    // ✅ Chuyển toàn bộ tutor sang object thường
    const profileData = tutor.toJSON();

    // ✅ Chuẩn hoá đường dẫn avatarUrl FE đang dùng
    profileData.avatarUrl = profileData.avatar_url
      ? profileData.avatar_url.startsWith("http")
        ? profileData.avatar_url
        : `${baseUrl}${profileData.avatar_url}`
      : "/default-avatar.png";

    // ✅ Xoá trường avatar_url gốc (để FE không bị nhầm)
    delete profileData.avatar_url;

    res.json({
      profileData,
      subjects: [],
      availability: [],
      materials: [],
      recentFeedback: [],
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy hồ sơ tutor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/update-profile", auth, updateTutorProfile);
router.post("/upload-avatar", auth, upload.single("avatar"), uploadTutorAvatar);

export default router;
