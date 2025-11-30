import { Session, User, Tutor, AvailabilitySlot } from "../models/index.js";
import { Op } from "sequelize";
const INT_TO_DAY_SHORT = {
  2: "Thứ 2", 3: "Thứ 3", 4: "Thứ 4", 5: "Thứ 5",
  6: "Thứ 6", 7: "Thứ 7", 8: "CN"
};

// GET /api/sessions/tutors (Tìm kiếm Tutor - ĐÃ CẬP NHẬT LOGIC LỊCH RẢNH)
export const searchTutors = async (req, res) => {
  try {
    const { search } = req.query;
    
    // Tìm trong bảng Tutor Profile
    const tutors = await Tutor.findAll({
      where: {
        name: { [Op.like]: `%${search || ""}%` }
      },
      include: [
        { 
          model: User, 
          as: "user", 
          attributes: ["avatar_url"],
          // ✅ JOIN THÊM BẢNG LỊCH RẢNH
          include: [{
            model: AvailabilitySlot,
            attributes: ["weekday"], // Chỉ cần lấy thứ
          }]
        }
      ]
    });

    // Format dữ liệu trả về FE
    const data = tutors.map(t => {
      // 1. Lấy danh sách các slot từ kết quả query
      // Sequelize thường trả về tên model số nhiều (availability_slots)
      const slots = t.user.availability_slots || [];

      // 2. Chuyển đổi số thành chữ và lọc trùng (Unique)
      const uniqueDays = [...new Set(slots.map(s => s.weekday))].sort();
      const availabilityText = uniqueDays.map(d => INT_TO_DAY_SHORT[d] || "N/A");
      let avatarFullUrl = null;
      if (t.user.avatar_url) {
        if (t.user.avatar_url.startsWith("http")) {
          avatarFullUrl = t.user.avatar_url; // Link ảnh online (nếu có)
        } else {
          // Link ảnh local -> Thêm localhost:3000
          avatarFullUrl = `${process.env.BASE_URL || "http://localhost:3000"}${t.user.avatar_url}`;
        }
      }
      return {
        id: t.user_id,
        name: t.name,
        subjects: t.specialization ? t.specialization.split(",").map(s => s.trim()) : ["Chưa cập nhật"],
        rating: parseFloat(t.rating_avg || 0),
        reviews: t.completed_sessions || 0,
        experience: t.experience_years || "Chưa cập nhật",
        hourlyRate: t.hourly_rate || 0,
        
        // ✅ DỮ LIỆU THẬT: Nếu không có lịch thì mảng rỗng
        availability: availabilityText.length > 0 ? availabilityText : [], 
        
        avatarColor: "bg-blue-100 text-blue-600", // Fallback màu nền avatar
        avatar: avatarFullUrl,
      };
    });

    res.json(data);
  } catch (err) {
    console.error("❌ searchTutors error:", err);
    res.status(500).json({ message: "Lỗi tìm kiếm gia sư" });
  }
};
// GET /api/sessions (Lấy lịch dạy/học của user hiện tại)
export const getMySessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;

    let whereClause = {};
    // Nếu là Tutor -> Lấy lịch mình dạy
    if (role === "tutor") whereClause = { tutor_id: userId };
    // Nếu là Student -> Lấy lịch mình học
    else if (role === "student") whereClause = { created_by_student_id: userId }; // Sửa lại field khớp model: created_by_student_id

    const sessions = await Session.findAll({
      where: whereClause,
      include: [
        { model: User, as: "created_by_student", attributes: ["full_name", "email"] }, // Sửa alias khớp model
        { model: User, as: "tutor", attributes: ["full_name", "email"] }
      ],
      order: [["start_at", "ASC"]]
    });

    // Format dữ liệu trả về cho Frontend
    const formatted = sessions.map(s => ({
      id: s.id,
      subject: s.subject_id ? "Môn học ID " + s.subject_id : "Chưa cập nhật môn", // Tạm thời
      student: s.created_by_student ? s.created_by_student.full_name : "Unknown",
      tutor: s.tutor ? s.tutor.full_name : "Unknown",
      date: s.start_at ? new Date(s.start_at).toISOString().split('T')[0] : "",
      time: s.start_at && s.end_at 
        ? `${new Date(s.start_at).getHours()}:00 - ${new Date(s.end_at).getHours()}:00` 
        : "N/A",
      location: s.location,
      mode: s.location === "Online" ? "online" : "offline",
      status: s.status,
      note: "Ghi chú...", // Model chưa có cột note, tạm để trống
    }));

    res.json(formatted);
  } catch (err) {
    console.error("❌ getMySessions error:", err);
    res.status(500).json({ message: "Lỗi lấy lịch" });
  }
};

// POST /api/sessions (Đặt lịch mới - Student gọi)
export const createSession = async (req, res) => {
  try {
    const { tutor_id, subject, date, time, mode, location } = req.body;
    const studentId = req.user.id;

    // 1. Xử lý thời gian
    const startHour = parseInt(time.split(":")[0]);
    const startAt = new Date(date);
    startAt.setHours(startHour, 0, 0, 0); // Giờ bắt đầu chính xác

    const endAt = new Date(startAt);
    endAt.setHours(startHour + 2, 0, 0, 0); // Giả sử học 2 tiếng

    // 2. KIỂM TRA TRÙNG LỊCH (Logic quan trọng)
    
    // A. Kiểm tra xem Tutor có bận vào giờ này không?
    const tutorBusy = await Session.findOne({
      where: {
        tutor_id: tutor_id,
        status: { [Op.not]: 'cancelled' }, // Bỏ qua các lớp đã hủy
        [Op.or]: [
          {
            start_at: { [Op.between]: [startAt, endAt] } // Bắt đầu trong khoảng giờ này
          },
          {
            end_at: { [Op.between]: [startAt, endAt] }   // Kết thúc trong khoảng giờ này
          },
          {
            // Hoặc bao trùm cả khoảng giờ này (Start < NewStart && End > NewEnd)
            [Op.and]: [
                { start_at: { [Op.lte]: startAt } },
                { end_at: { [Op.gte]: endAt } }
            ]
          }
        ]
      }
    });

    if (tutorBusy) {
        return res.status(409).json({ message: "Gia sư đã có lịch dạy vào khung giờ này." });
    }

    // B. Kiểm tra xem Sinh viên (chính mình) có bận không?
    const studentBusy = await Session.findOne({
        where: {
          created_by_student_id: studentId,
          status: { [Op.not]: 'cancelled' },
          [Op.or]: [
            { start_at: { [Op.between]: [startAt, endAt] } },
            { end_at: { [Op.between]: [startAt, endAt] } },
            {
                [Op.and]: [
                    { start_at: { [Op.lte]: startAt } },
                    { end_at: { [Op.gte]: endAt } }
                ]
            }
          ]
        }
    });

    if (studentBusy) {
        return res.status(409).json({ message: "Bạn bị trùng lịch học với một gia sư khác." });
    }

    // 3. Nếu không trùng -> Tạo mới
    const session = await Session.create({
      created_by_student_id: studentId,
      tutor_id,
      subject: subject || "Môn học chung",
      start_at: startAt,
      end_at: endAt,
      location: mode === "online" ? "Online" : location,
      status: "pending"
    });

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi đặt lịch" });
  }
};

export const updateSessionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'confirmed' hoặc 'cancelled'
    const userId = req.user.id;

    // 1. Validate trạng thái hợp lệ
    const validStatuses = ["confirmed", "cancelled", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // 2. Tìm buổi học
    const session = await Session.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: "Không tìm thấy buổi học" });
    }

    // 3. Bảo mật: Chỉ Tutor của buổi học này mới được quyền duyệt
    if (session.tutor_id !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa lớp này" });
    }

    // 4. Cập nhật
    session.status = status;
    await session.save();

    res.json({ message: "Cập nhật thành công", session });
  } catch (err) {
    console.error("❌ updateSessionStatus error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};