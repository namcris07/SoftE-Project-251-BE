import bcrypt from "bcrypt";
import { User, Role, Tutor, Student } from "../models/index.js";
import { Op } from "sequelize";
/**
 * GET /api/users
 * Trả danh sách user (ẩn password), kèm role.name
 */
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.findAll({
      // 🔴 BỎ DÒNG attributes NÀY ĐI (Comment lại hoặc xóa)
      // attributes: ["id", "full_name", "email", "createdAt"], 
      
      // Giữ nguyên các phần khác
      include: [{ model: Role, attributes: ["name"] }],
      order: [["id", "ASC"]],
    });

    const cleaned = users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role ? u.role.name : "unknown",
      
      // ✅ SỬA: Lấy createdAt an toàn (nếu không có thì trả về null hoặc chuỗi rỗng)
      // Sequelize thường trả về u.createdAt hoặc u.dataValues.created_at
      createdAt: u.createdAt || u.created_at || null 
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
    const { email, full_name, password, role } = req.body;

    // 1. Validate
    if (!email || !full_name || !password || !role) {
      return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email này đã được sử dụng" });
    }

    const roleRecord = await Role.findOne({ where: { name: role } });
    if (!roleRecord) {
      return res.status(400).json({ message: "Vai trò không hợp lệ" });
    }

    // 2. Tạo User (Account)
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      full_name,
      password: hash,
      role_id: roleRecord.id,
      status: "active",
    });

    // 3. ✅ TỰ ĐỘNG TẠO PROFILE THEO ROLE
    if (role === "tutor") {
      await Tutor.create({
        user_id: user.id, // Link với user vừa tạo
        name: full_name,  // Lấy tên user làm tên hiển thị ban đầu
        email: email,
        // Các trường khác để null hoặc default
        hourly_rate: 0,
        rating_avg: 0,
        total_students: 0,
        completed_sessions: 0
      });
    } else if (role === "student") {
      await Student.create({
        user_id: user.id,
        // Các trường khác để null
        total_sessions: 0,
        completed_sessions: 0,
        training_points: 0
      });
    }

    res.status(201).json({ message: "Tạo người dùng & hồ sơ thành công", id: user.id });

  } catch (err) {
    console.error("❌ createUser error:", err);
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
};

// ✅ Thêm mới: Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, password, status } = req.body; 

    const user = await User.findByPk(id, {
        include: [{ model: Role, attributes: ["name"] }]
    });
    
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // 1. Cập nhật thông tin cơ bản
    if (full_name) user.full_name = full_name;
    if (status) user.status = status;
    if (password) user.password = await bcrypt.hash(password, 10);

    // 2. Xử lý logic đổi Role (QUAN TRỌNG)
    if (role && role !== user.role.name) {
      const roleRecord = await Role.findOne({ where: { name: role } });
      if (!roleRecord) return res.status(400).json({ message: "Role không hợp lệ" });
      
      user.role_id = roleRecord.id;

      // Tự động tạo hồ sơ tương ứng nếu chưa có
      if (role === "tutor") {
        const existingTutor = await Tutor.findOne({ where: { user_id: user.id } });
        if (!existingTutor) {
            await Tutor.create({
                user_id: user.id,
                name: user.full_name,
                email: user.email,
                hourly_rate: 0,
                rating_avg: 0
            });
        }
      } else if (role === "student") {
        const existingStudent = await Student.findOne({ where: { user_id: user.id } });
        if (!existingStudent) {
            await Student.create({
                user_id: user.id,
                total_sessions: 0,
                training_points: 0
            });
        }
      }
    }

    await user.save();
    res.json({ message: "Cập nhật người dùng thành công" });
  } catch (err) {
    console.error("❌ updateUser error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ✅ Thêm mới: Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Xóa mềm hoặc xóa cứng tùy nghiệp vụ (ở đây dùng xóa cứng theo hàm destroy)
    await user.destroy();
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("❌ deleteUser error:", err);
    res.status(500).json({ message: "Lỗi server" });
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
export const getContacts = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Lấy ID từ token

    const users = await User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }, // Không lấy chính mình
        status: "active", // Chỉ lấy user đang hoạt động
      },
      attributes: ["id", "full_name", "email", "avatar_url"], // Chỉ lấy thông tin cần thiết
      include: [{ model: Role, attributes: ["name"] }], // Kèm vai trò
      order: [["full_name", "ASC"]],
    });

    // Format lại dữ liệu cho gọn
    const data = users.map((u) => ({
      id: u.id,
      name: u.full_name,
      email: u.email,
      avatar: u.avatar_url,
      role: u.role ? u.role.name : "member",
    }));

    res.json(data);
  } catch (err) {
    console.error("❌ getContacts error:", err);
    res.status(500).json({ message: "Lỗi lấy danh sách liên hệ" });
  }
};
