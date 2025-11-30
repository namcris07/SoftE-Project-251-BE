
import multer from "multer";
import path from "path";
import fs from "fs";
import { 
  User, 
  Tutor, 
  TutorSubject, 
  TutorAvailability, 
  TutorMaterial, 
  TutorFeedback 
} from "../models/index.js";
// Bản đồ ngày trong tuần (dạng số → tiếng Việt)
const weekdayMap = {
  0: "Chủ nhật",
  1: "Thứ 2",
  2: "Thứ 3",
  3: "Thứ 4",
  4: "Thứ 5",
  5: "Thứ 6",
  6: "Thứ 7",
};

// Hàm gom lịch dạy thành chuỗi dễ đọc
function buildAvailabilityStrings(rows) {
  const grouped = {};
  for (const slot of rows) {
    if (!grouped[slot.weekday]) grouped[slot.weekday] = [];
    const start = slot.start_time.slice(0, 5);
    const end = slot.end_time.slice(0, 5);
    grouped[slot.weekday].push(`${start}-${end}`);
  }

  const result = [];
  Object.keys(grouped)
    .sort((a, b) => Number(a) - Number(b))
    .forEach((wd) => {
      const label = weekdayMap[wd] ?? `Thứ ${wd}`;
      const ranges = [...new Set(grouped[wd])].join(", ");
      result.push(`${label}: ${ranges}`);
    });

  return result;
}
const uploadDir = path.join(process.cwd(), "uploads/avatars");

// ⚙️ Cấu hình nơi lưu ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `tutor_${req.user.id}_${Date.now()}${ext}`);
  },
});

export const upload = multer({ storage });

// 📤 API upload avatar
export const uploadTutorAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa chọn file" });

    const userId = req.user.id;
    // Đường dẫn tương đối lưu trong DB (VD: /uploads/avatars/filename.jpg)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // ✅ QUAN TRỌNG: Cập nhật bảng User (Nơi API Search lấy dữ liệu)
    await User.update(
      { avatar_url: avatarUrl }, 
      { where: { id: userId } }
    );

    // Cập nhật luôn bảng Tutor cho đồng bộ (Optional)
    await Tutor.update(
      { avatar_url: avatarUrl }, 
      { where: { user_id: userId } }
    );

    // Trả về đường dẫn đầy đủ cho Frontend hiển thị ngay
    const fullUrl = `${process.env.BASE_URL || "http://localhost:3000"}${avatarUrl}`;

    res.json({ 
      message: "Upload ảnh thành công", 
      avatarUrl: fullUrl 
    });

  } catch (err) {
    console.error("❌ Upload avatar error:", err);
    res.status(500).json({ message: "Lỗi server khi upload ảnh" });
  }
};

// ================== HÀM CHÍNH ==================
export async function getTutorProfileView(req, res) {
  try {
    const tutorUserId = req.params.id; // user.id

    // 1️⃣ Lấy user + hồ sơ tutor
    const u = await User.findByPk(tutorUserId, {
      include: [{ model: Tutor, as: "tutorProfile" }],
    });

    if (!u || !u.tutorProfile) {
      return res.status(404).json({ error: "Tutor not found" });
    }

    const tp = u.tutorProfile;
    const tutorId = tp.tutor_id; // ID trong bảng tutors

    // 2️⃣ Môn học
    const subjectsRaw = await TutorSubject.findAll({
      where: { tutor_id: tutorId },
      order: [["id", "ASC"]],
    });
    const subjects = [...new Set(subjectsRaw.map((s) => s.subject))];

    // 3️⃣ Lịch dạy
    const availabilityRows = await TutorAvailability.findAll({
      where: { tutor_id: tutorId },
      order: [
        ["weekday", "ASC"],
        ["start_time", "ASC"],
      ],
    });
    const availability = [...new Set(buildAvailabilityStrings(availabilityRows))];

    // 4️⃣ Tài liệu
    const materialsRaw = await TutorMaterial.findAll({
      where: { tutor_id: tutorId },
      order: [["created_at", "DESC"]],
    });
    const materialsMap = new Map();
    for (const m of materialsRaw) {
      const key = m.title + "|" + m.created_at;
      if (!materialsMap.has(key)) {
        materialsMap.set(key, {
          id: m.material_id ?? m.id,
          title: m.title,
          type: m.file_type || m.type,
          size:
            m.file_size_mb != null
              ? `${Number(m.file_size_mb).toFixed(2)} MB`
              : "N/A",
          uploadDate: m.upload_date,
          downloads: m.downloads ?? 0,
        });
      }
    }
    const materials = Array.from(materialsMap.values());

    // 5️⃣ Feedback
    const feedbackRows = await TutorFeedback.findAll({
      where: { tutor_id: tutorId },
      limit: 5,
      order: [["feedback_date", "DESC"]],
    });
    const feedbackMap = new Map();
    for (const f of feedbackRows) {
      const key = f.student_name + "|" + f.comment;
      if (!feedbackMap.has(key)) {
        feedbackMap.set(key, {
          student: f.student_name ?? "Ẩn danh",
          subject: f.subject ?? "Không rõ môn",
          rating: f.rating,
          comment: f.comment,
          date: f.feedback_date,
        });
      }
    }
    const recentFeedback = Array.from(feedbackMap.values());

    // 6️⃣ Hồ sơ chính
   const profileData = {
      name: u.full_name,
      email: u.email,
      phone: tp.phone,
      department: tp.department,
      specialization: tp.specialization,
      experience_years: tp.experience_years || null,
      education: tp.education,
      bio: tp.bio,
      hourlyRate: tp.hourly_rate,
      rating: Number(tp.rating_avg || 0),
      totalStudents: tp.total_students,
      completedSessions: tp.completed_sessions,
      // ✅ Ưu tiên lấy ảnh từ User (vì Header dùng bảng User)
      avatarUrl: u.avatar_url ? `${process.env.BASE_URL || "http://localhost:3000"}${u.avatar_url}` : null
    };


    // 7️⃣ Trả về FE
    return res.json({
      profileData,
      subjects,
      availability,
      materials,
      recentFeedback,
    });
  } catch (err) {
    console.error("❌ Error in getTutorProfileView:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export const updateTutorProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.user_id;
    if (!userId) return res.status(400).json({ error: "Missing user_id" });

    const tutor = await Tutor.findOne({ where: { user_id: userId } });
    if (!tutor) return res.status(404).json({ error: "Tutor not found" });

    const {
      name, email, phone, department, 
      experience_years, education, bio, hourly_rate,
      subjects // ✅ Nhận thêm mảng subjects từ Frontend (VD: ["Toán", "Lý"])
    } = req.body;

    // A. Cập nhật thông tin cơ bản (Bảng Tutor)
    // Lưu ý: Ta cũng lưu danh sách môn vào 'specialization' dạng chuỗi để tiện hiển thị nhanh
    const specializationString = subjects && Array.isArray(subjects) ? subjects.join(", ") : tutor.specialization;

    await tutor.update({
      phone: phone || tutor.phone,
      department: department || tutor.department,
      specialization: specializationString, 
      experience_years: experience_years || tutor.experience_years,
      education: education || tutor.education,
      bio: bio || tutor.bio,
      hourly_rate: Number(hourly_rate) || tutor.hourly_rate || 0,
      updated_at: new Date(),
    });

    // B. Cập nhật Tên (Bảng User)
    if (name) {
      await User.update({ full_name: name }, { where: { id: userId } });
    }

    // C. ✅ Cập nhật Bảng TutorSubject (Quan trọng cho tìm kiếm/lọc)
    if (subjects && Array.isArray(subjects)) {
      // 1. Xóa môn cũ
      await TutorSubject.destroy({ where: { tutor_id: tutor.tutor_id } });
      
      // 2. Thêm môn mới
      if (subjects.length > 0) {
        const subjectData = subjects.map(sub => ({
          tutor_id: tutor.tutor_id,
          subject: sub
        }));
        await TutorSubject.bulkCreate(subjectData);
      }
    }

    res.json({
      message: "Profile updated successfully",
      profileData: tutor,
    });
  } catch (err) {
    console.error("❌ Update profile error:", err);
    res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
