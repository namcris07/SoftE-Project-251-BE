import express from "express";
import bcrypt from "bcryptjs";

import { User, Role } from "../models/index.js";

const router = express.Router();

// 🟦 Lấy danh sách user
router.get("/users", async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Role, as: "role", attributes: ["name"] }],
      attributes: ["id", "full_name", "email", "status", "created_at"],
      order: [["id", "ASC"]],
    });

    const formatted = users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role ? u.role.name : "student",
      status: u.status,
      createdAt: u.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ GET /users error:", err);
    res.status(500).json({ message: "Server error (GET)" });
  }
});

// 🟩 Tạo user mới
router.post("/users", async (req, res) => {
  try {
    const { email, full_name, password, role = "student" } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const foundRole = await Role.findOne({ where: { name: role } });

    if (!foundRole)
      return res.status(400).json({ message: "Vai trò không hợp lệ" });

    const user = await User.create({
      email,
      full_name,
      password: hashed,
      role_id: foundRole.id,
    });

    res.json({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role,
    });
  } catch (err) {
    console.error("❌ POST /users error:", err);
    res.status(500).json({ message: "Server error (POST)" });
  }
});

// 🟨 Cập nhật user
router.put("/users/:id", async (req, res) => {
  try {
    const { email, full_name, password } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (email) user.email = email;
    if (full_name) user.full_name = full_name;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error("❌ PUT /users/:id error:", err);
    res.status(500).json({ message: "Server error (PUT)" });
  }
});

// 🟥 Xóa user
router.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);

    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    await user.destroy();
    res.json({ message: "🗑️ Xóa thành công" });
  } catch (err) {
    console.error("❌ DELETE /users/:id error:", err);
    res.status(500).json({ message: "Server error (DELETE)" });
  }
});

export default router;
