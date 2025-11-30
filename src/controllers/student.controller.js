import { User, Student } from "../models/index.js";
import multer from "multer";
import path from "path";

// Cấu hình Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars/"); // Đảm bảo thư mục này tồn tại
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "student-" + uniqueSuffix + path.extname(file.originalname));
  },
});
export const upload = multer({ storage: storage });

// --- Helper: Lấy dữ liệu chuẩn ---
const getStudentData = async (userId) => {
  const user = await User.findByPk(userId, {
    include: [{ model: Student, as: "studentProfile" }],
  });

  if (!user) return null;

  // Nếu chưa có profile student thì trả về object rỗng để FE không lỗi
  const student = user.studentProfile || {};

  // Xử lý Avatar URL
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  let avatarFullUrl = null;
  
  // Ưu tiên lấy avatar từ User (vì Header dùng cái này)
  if (user.avatar_url) {
    avatarFullUrl = user.avatar_url.startsWith("http") 
      ? user.avatar_url 
      : `${baseUrl}${user.avatar_url}`;
  }

  return {
    // Dữ liệu từ bảng User
    id: user.id,
    name: user.full_name,
    email: user.email,
    avatarUrl: avatarFullUrl, 

    // Dữ liệu từ bảng Student
    mssv: student.mssv || "",
    phone: student.phone || "",
    faculty: student.faculty || "",
    major: student.major || "",
    enrollmentYear: student.enrollment_year || "",
    address: student.address || "",
    bio: student.bio || "",
    
    // Stats
    stats: {
      totalSessions: student.total_sessions || 0,
      completedSessions: student.completed_sessions || 0,
      trainingPoints: student.training_points || 0,
    },
  };
};

// GET: Lấy hồ sơ
export const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const data = await getStudentData(userId);
    if (!data) return res.status(404).json({ message: "User không tồn tại" });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// PUT: Cập nhật hồ sơ
export const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, faculty, major, enrollmentYear, address, bio } = req.body;

    // 1. Cập nhật bảng USER (Tên)
    if (name) {
      await User.update({ full_name: name }, { where: { id: userId } });
    }

    // 2. Cập nhật bảng STUDENT
    // Dùng findOrCreate để nếu chưa có thì tạo mới luôn
    let [student, created] = await Student.findOrCreate({
        where: { user_id: userId },
        defaults: {
            phone, faculty, major, enrollment_year: enrollmentYear, address, bio
        }
    });

    if (!created) {
        await student.update({
            phone,
            faculty,
            major,
            enrollment_year: enrollmentYear,
            address,
            bio
        });
    }

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};

// POST: Upload Avatar
export const uploadStudentAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa chọn file" });

    const userId = req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // ✅ QUAN TRỌNG: Update vào bảng User để đồng bộ toàn hệ thống
    await User.update({ avatar_url: avatarUrl }, { where: { id: userId } });
    
    // Update luôn vào bảng Student (nếu cần thiết kế thừa)
    await Student.update({ avatar_url: avatarUrl }, { where: { user_id: userId } });

    const fullUrl = `${process.env.BASE_URL || "http://localhost:3000"}${avatarUrl}`;

    res.json({ message: "Upload ảnh thành công", avatarUrl: fullUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi upload ảnh" });
  }
};