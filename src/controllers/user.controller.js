import bcrypt from "bcrypt";
import { User, Role } from "../models/index.js";

/**
 * GET /api/users
 * Trả danh sách user (ẩn password), kèm role.name
 */
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "full_name", "email"], // ❌ không chọn createdAt nếu DB dùng created_at
      include: [{ model: Role, attributes: ["name"] }],
      order: [["id", "ASC"]],
    });

    // Chuẩn hóa output, không trả password
    const cleaned = users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.Role?.name || null,
    }));

    res.json(cleaned);
  } catch (err) {
    console.error("❌ getAllUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/users
 * body: { email, full_name, password, roleName }
 */
export const createUser = async (req, res) => {
  try {
    const { email, full_name, password, roleName } = req.body;
    if (!email || !full_name || !password || !roleName) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) return res.status(400).json({ message: "Invalid role" });

    const hash = await bcrypt.hash(password, 10);

    // ✅ dùng đúng tên cột role_id (DB của bạn dùng underscored)
    const user = await User.create({
      email,
      full_name,
      password: hash,
      role_id: role.id,
    });

    res.status(201).json({ id: user.id });
  } catch (err) {
    console.error("❌ createUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/users/me  (yêu cầu header Authorization: Bearer <token>)
 * Đọc user từ token (req.user.id)
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "full_name", "email"],
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    res.json({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role?.name || "unknown", // ✅ tránh undefined
    });
  } catch (err) {
    console.error("❌ Lỗi getUserProfile:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

