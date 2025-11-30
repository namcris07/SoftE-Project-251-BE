import cron from "node-cron";
import { Op } from "sequelize";
import { Session, Course, Enrollment, Notification } from "../models/index.js";

const REMINDER_HOURS_BEFORE = 2; // Nhắc trước 2 tiếng

export const startReminderJob = () => {
  console.log("⏰ [CRON] Hệ thống nhắc lịch đã khởi động...");

  // ⚠️ SỬA LẠI: '* * * * *' (Chạy mỗi phút để test) 
  // Sau khi test xong nhớ đổi thành '*/30 * * * *' (Mỗi 30 phút)
  cron.schedule('*/30 * * * *', async () => {
    console.log("⏰ [CRON] Đang quét lịch học...");
    
    try {
      const now = new Date();
      // Tìm trong khoảng: Từ bây giờ -> 2 tiếng sau
      const futureTime = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

      // 1. Tìm các buổi học SẮP DIỄN RA và CHƯA GỬI THÔNG BÁO
      const upcomingSessions = await Session.findAll({
        where: {
          start_at: { [Op.between]: [now, futureTime] },
          status: 'upcoming',
          is_reminder_sent: false // Chỉ lấy những buổi chưa gửi
        },
        include: [{ model: Course, as: "course", attributes: ["id", "title"] }]
      });

      if (upcomingSessions.length === 0) return;

      // 2. Gửi thông báo
      for (const session of upcomingSessions) {
        // Format giờ VN (Lưu ý: Server phải đúng múi giờ hoặc DB lưu UTC chuẩn)
        const timeString = new Date(session.start_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const notifs = [];

        // A. Nhắc Tutor
        notifs.push({
          user_id: session.tutor_id,
          title: "Nhắc nhở lịch dạy",
          message: `Bạn có lịch dạy lớp "${session.course.title}" lúc ${timeString} hôm nay.`,
          type: "schedule",
          data: { courseId: session.course_id }
        });

        // B. Nhắc Student (Chỉ những người Active)
        const enrollments = await Enrollment.findAll({ 
            where: { course_id: session.course_id, status: 'active' } 
        });
        
        enrollments.forEach(e => {
          notifs.push({
            user_id: e.student_id,
            title: "Nhắc nhở lịch học",
            message: `Sắp đến giờ học lớp "${session.course.title}" (${timeString}). Hãy chuẩn bị nhé!`,
            type: "schedule",
            data: { courseId: session.course_id }
          });
        });

        // Lưu vào DB
        if (notifs.length > 0) await Notification.bulkCreate(notifs);

        // C. Đánh dấu đã gửi để không gửi lại lần sau
        session.is_reminder_sent = true;
        await session.save();
      }
      
      console.log(`✅ [CRON] Đã gửi nhắc nhở cho ${upcomingSessions.length} buổi học.`);
    } catch (err) {
      console.error("❌ [CRON ERROR]", err);
    }
  });
};