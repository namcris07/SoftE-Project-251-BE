import express from "express";
import { auth, requireRole } from "../middleware/auth.middleware.js";
import { Booking, User } from "../models/index.js"; // ✅ Import Booking và User

const router = express.Router();

// 1. GET /api/bookings/my-schedule: Lấy lịch học/dạy của người dùng
// Sử dụng cho StudentSchedule.jsx (cả Student và Tutor view)
router.get("/my-schedule", auth, async (req, res) => {
  const { id: userId, role } = req.user;
  let whereClause = {};

  if (role === "student") {
    whereClause.student_id = userId;
  } else if (role === "tutor") {
    whereClause.tutor_id = userId;
  } else {
    return res.status(403).json({ message: "Vai trò không hợp lệ để xem lịch cá nhân" });
  }

  try {
    const bookings = await Booking.findAll({
      where: whereClause,
      // Lấy tên của đối tác
      include: [
        { model: User, as: "Student", attributes: ["full_name"] },
        { model: User, as: "Tutor", attributes: ["full_name"] },
      ],
      order: [["session_date", "ASC"], ["start_time", "ASC"]],
    });

    res.json(bookings);
  } catch (error) {
    console.error("Lỗi khi lấy lịch:", error);
    res.status(500).json({ message: "Lỗi server khi tải lịch." });
  }
});

// 2. POST /api/bookings: Sinh viên đặt lịch mới
// Sử dụng cho SessionScheduling.jsx (sau khi chọn gia sư)
router.post("/", auth, requireRole("student"), async (req, res) => {
  const student_id = req.user.id;
  const { tutor_id, subject, session_date, start_time, end_time, location, mode, notes } = req.body;

  if (!tutor_id || !session_date || !start_time || !subject) {
    return res.status(400).json({ message: "Thiếu thông tin cần thiết." });
  }

  try {
    const newBooking = await Booking.create({
      student_id,
      tutor_id,
      subject,
      session_date,
      start_time,
      end_time,
      location,
      mode,
      notes,
      status: "pending", // Mặc định là chờ xác nhận
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Lỗi khi đặt lịch:", error);
    res.status(500).json({ message: "Đặt lịch thất bại." });
  }
});


// 3. PATCH /api/bookings/:id: Cập nhật status (Hủy/Xác nhận)
// Sử dụng cho StudentSchedule.jsx (Hủy) và Tutor Dashboard (Xác nhận)
router.patch("/:id", auth, async (req, res) => {
  const bookingId = req.params.id;
  const userId = req.user.id;
  const userRole = req.user.role;
  const { status } = req.body;
  const allowedStatus = ["confirmed", "cancelled", "completed"];

  if (!status || !allowedStatus.includes(status)) {
    return res.status(400).json({ message: "Trạng thái cập nhật không hợp lệ." });
  }

  try {
    const booking = await Booking.findByPk(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking không tồn tại." });

    // Sinh viên chỉ được hủy booking của mình
    if (userRole === "student" && booking.student_id === userId && status === "cancelled") {
      booking.status = "cancelled";
    } 
    // Gia sư được cập nhật trạng thái booking của mình
    else if (userRole === "tutor" && booking.tutor_id === userId) {
      booking.status = status;
    } 
    else {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật booking này." });
    }
    
    await booking.save();
    res.json(booking);
  } catch (error) {
    console.error("Lỗi khi cập nhật booking:", error);
    res.status(500).json({ message: "Lỗi server khi cập nhật booking." });
  }
});


export default router;