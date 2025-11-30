import express from "express";
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  getUserProfile,
  getContacts 
} from "../controllers/user.controller.js";
// Import cả auth và checkAdmin
import { auth, checkAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Route công khai hoặc cá nhân (Chỉ cần đăng nhập)
router.get("/me", auth, getUserProfile);

// 🛡️ Cụm Route dành riêng cho Admin (Có thêm checkAdmin)
// Áp dụng auth trước để lấy user, sau đó checkAdmin để kiểm tra quyền
router.get("/", auth, checkAdmin, getAllUsers);       // Xem danh sách
router.post("/", auth, checkAdmin, createUser);   
router.get("/contacts", auth, getContacts);    // Lấy danh sách liên hệ
router.put("/:id", auth, checkAdmin, updateUser);     // Cập nhật
router.delete("/:id", auth, checkAdmin, deleteUser);  // Xóa

export default router;