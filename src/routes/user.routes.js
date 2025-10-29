import express from "express";
import { getUserProfile } from "../controllers/user.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Lấy thông tin user hiện tại
router.get("/me", auth, getUserProfile);

// ✅ Lấy tất cả user (admin)
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "full_name", "email", "role", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
