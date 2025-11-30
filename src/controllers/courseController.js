// controllers/course.controller.js
import { sequelize } from "../config/database.js";
import { Course, Session, User, Enrollment, Notification,SessionReport,Document, Assignment, AssignmentSubmission,Feedback } from "../models/index.js";

// --- 1. LẤY DANH SÁCH LỚP (ĐÃ SỬA: Trả về sessions để hiện giờ kết thúc) ---
export const getCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await Course.findAll({
      include: [
        { model: User, as: "tutor", attributes: ["full_name", "id"] },
        { 
          model: User, 
          as: "students", 
          attributes: ["id"], 
          through: { attributes: ["status"] } 
        },
        // Lấy 1 session để hiển thị lịch "chữa cháy" nếu schedule_text null
        { 
          model: Session, 
          as: "sessions", 
          attributes: ["start_at", "end_at"],
          limit: 1 
        }
      ],
      order: [["id", "DESC"]]
    });

    const formatted = courses.map(c => {
      const myEnrollment = c.students.find(s => s.id === userId);
      
      let duration = 90;
      // 👇 Format session để trả về Frontend (Giờ bắt đầu - Giờ kết thúc)
      let formattedSessions = []; 
      if (c.sessions && c.sessions.length > 0) {
        const start = new Date(c.sessions[0].start_at);
        const end = new Date(c.sessions[0].end_at);
        
        // Tính duration
        const diff = Math.round((end - start) / 60000);
        if (diff > 0) duration = diff;

        // Format giờ: "08:00 - 09:30"
        const timeStr = `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')} - ${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`;
        
        formattedSessions.push({
            date: c.sessions[0].start_at,
            time: timeStr // ✅ Đã có cả giờ kết thúc
        });
      }

      return {
        id: c.id,
        title: c.title,
        subject: c.subject,
        tutor_id: c.tutor_id,
        tutor_name: c.tutor?.full_name,
        max_students: c.max_students,
        current_students: c.current_students,
        schedule_text: c.schedule_text,
        location: c.location,
        require_approval: c.require_approval,
        is_registered: !!myEnrollment,
        enrollment_status: myEnrollment ? myEnrollment.Enrollment.status : null,
        duration: duration,
        sessions: formattedSessions // ✅ Trả về session để Frontend fallback
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy danh sách lớp" });
  }
};

// --- 2. TẠO LỚP HỌC (ĐÃ SỬA: Lưu đủ Giờ bắt đầu - Kết thúc vào text) ---
export const createCourse = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    let { 
      title, subject, max_students, 
      schedule_text, location, require_approval, sessions 
    } = req.body;
    const tutorId = req.user.id;

    // 🟢 LOGIC MỚI: Tự động tạo schedule_text ĐẦY ĐỦ
    if ((!schedule_text || schedule_text.trim() === "") && sessions && sessions.length > 0) {
      try {
        // 1. Lấy chuỗi giờ (VD: "08:00 - 09:30")
        // Lưu ý: Frontend gửi lên là "08:00 - 09:30" nên ta lấy nguyên, không split nữa
        const timeStr = sessions[0].time || "00:00 - 00:00"; 
        
        // 2. Lấy các thứ trong tuần
        const uniqueDays = [...new Set(sessions.map(s => {
          const date = new Date(s.date);
          const day = date.getDay(); 
          return day === 0 ? "CN" : `T${day + 1}`;
        }))].sort();

        // 3. Ghép chuỗi: "T2, T4 (08:00 - 09:30)"
        schedule_text = `${uniqueDays.join(", ")} (${timeStr})`;
      } catch (e) {
        schedule_text = "Xem chi tiết";
      }
    }
    // 🔴 KẾT THÚC LOGIC

    const newCourse = await Course.create({
      title,
      subject,
      tutor_id: tutorId,
      max_students,
      schedule_text: schedule_text || "Chưa cập nhật",
      location,
      require_approval,
      current_students: 0
    }, { transaction: t });

    if (sessions && sessions.length > 0) {
      const sessionData = sessions.map(s => ({
        course_id: newCourse.id,
        title: s.title,
        tutor_id: tutorId,
        start_at: new Date(`${s.date}T${s.time.split(" - ")[0]}`),
        end_at: new Date(`${s.date}T${s.time.split(" - ")[1]}`),
        location: location,
      }));

      await Session.bulkCreate(sessionData, { transaction: t });
    }

    await t.commit();
    res.status(201).json({ message: "Tạo lớp thành công", courseId: newCourse.id });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Lỗi tạo lớp học" });
  }
};

// ... (Giữ nguyên registerCourse, cancelRegistration)
// --- 3. ĐĂNG KÝ LỚP (ĐÃ SỬA: HỖ TRỢ WAITLIST) ---
export const registerCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user.id;

    const course = await Course.findByPk(id);
    if (!course) return res.status(404).json({ message: "Lớp không tồn tại" });

    // Kiểm tra đã đăng ký chưa
    const existing = await Enrollment.findOne({
      where: { course_id: id, student_id: studentId }
    });
    
    if (existing) {
        // Nếu đang ở waitlist mà bấm lại thì báo luôn
        if (existing.status === 'waitlist') {
            return res.status(400).json({ message: "Bạn đã nằm trong danh sách chờ rồi" });
        }
        return res.status(400).json({ message: "Bạn đã đăng ký lớp này rồi" });
    }

    let status = "active";
    let msg = "Đăng ký thành công!";
    
    // 1. Nếu lớp cần duyệt -> Luôn là pending
    if (course.require_approval) {
      status = "pending";
      msg = "Đã gửi yêu cầu, vui lòng chờ Tutor duyệt.";
      
      await Notification.create({
        user_id: course.tutor_id,
        title: "Yêu cầu đăng ký mới",
        message: `Có học viên mới muốn tham gia lớp "${course.title}".`,
        type: "registration",
        data: { courseId: course.id }
      });

    } else {
      // 2. Nếu lớp KHÔNG cần duyệt
      // Kiểm tra sĩ số
      if (course.current_students >= course.max_students) {
        // ✅ LOGIC MỚI: Lớp đầy -> Chuyển vào WAITLIST (không báo lỗi 400 nữa)
        status = "waitlist";
        msg = "Lớp đã đầy. Bạn đã được xếp vào danh sách chờ (Waitlist).";
        
        // Lưu ý: Waitlist thì KHÔNG tăng current_students
      } else {
        // Lớp chưa đầy -> Vào học luôn (Active)
        status = "active";
        await course.increment("current_students");
        
        await Notification.create({
          user_id: studentId,
          title: "Đăng ký thành công",
          message: `Chào mừng bạn đến với lớp "${course.title}".`,
          type: "approval",
          data: { courseId: course.id }
        });
      }
    }

    // Tạo bản ghi Enrollment
    await Enrollment.create({
      course_id: id,
      student_id: studentId,
      status: status
    });

    res.json({ message: msg, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi đăng ký" });
  }
};
  
  // --- 4. HỦY LỚP (ĐÃ SỬA: TỰ ĐỘNG ĐẨY WAITLIST VÀO LỚP) ---
export const cancelRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params; // courseId
    const studentId = req.user.id;

    // 1. Tìm bản ghi đăng ký cần hủy
    const enrollment = await Enrollment.findOne({
      where: { course_id: id, student_id: studentId }
    });

    if (!enrollment) {
      await t.rollback();
      return res.status(404).json({ message: "Chưa tham gia lớp này" });
    }

    const wasActive = enrollment.status === "active";

    // 2. Xóa bản ghi của người hủy trước
    await enrollment.destroy({ transaction: t });

    // 3. Xử lý logic thế chỗ (Chỉ khi người hủy là Active)
    if (wasActive) {
      // Tìm người xếp hàng lâu nhất trong Waitlist
      const nextInLine = await Enrollment.findOne({
        where: { course_id: id, status: 'waitlist' },
        order: [['created_at', 'ASC']], // Ưu tiên người đến trước (FIFO)
        transaction: t
      });

      if (nextInLine) {
        // TRƯỜNG HỢP A: CÓ NGƯỜI CHỜ -> THẾ CHỖ NGAY
        
        // Cập nhật trạng thái người chờ thành Active
        nextInLine.status = 'active';
        // Cập nhật thời gian vào lớp chính thức là lúc này
        nextInLine.enrolled_at = new Date(); 
        await nextInLine.save({ transaction: t });

        // Gửi thông báo cho người may mắn
        await Notification.create({
          user_id: nextInLine.student_id,
          title: "Bạn đã được vào lớp!",
          message: "Một chỗ trống vừa mở ra và bạn đã được chuyển từ danh sách chờ vào lớp chính thức.",
          type: "approval",
          data: { courseId: id }
        }, { transaction: t });

        // ⚠️ QUAN TRỌNG: KHÔNG giảm current_students vì 1 người ra, 1 người vào -> Tổng không đổi.

      } else {
        // TRƯỜNG HỢP B: KHÔNG CÓ AI CHỜ -> GIẢM SĨ SỐ
        await Course.decrement("current_students", { 
          where: { id },
          transaction: t 
        });
      }
    }

    await t.commit();
    res.json({ message: "Đã hủy đăng ký thành công" });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Lỗi hủy lớp" });
  }
};

// --- 5. LẤY CHI TIẾT LỚP (Đã chuẩn) ---
export const getCourseDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
       include: [
        { model: Session, as: "sessions" },
        {
          model: User,
          as: "students",
          attributes: ["id", "full_name", "email","avatar_url"],
          through: { attributes: ["status", "enrolled_at"] }
        },
        { model: User, as: "tutor", attributes: ["full_name", "id"] }
      ],
      order: [
        [{ model: Session, as: "sessions" }, "start_at", "ASC"]
      ]
    });

    if (!course) return res.status(404).json({ message: "Không tìm thấy lớp" });

    let duration = 90;
    if (course.sessions && course.sessions.length > 0) {
        const s = course.sessions[0];
        const start = new Date(s.start_at);
        const end = new Date(s.end_at);
        const diff = Math.round((end - start) / 60000);
        if (diff > 0) duration = diff;
    }

    const studentsFormatted = course.students.map(s => ({
      id: s.id,
      name: s.full_name,
      email: s.email,
      phone: s.phone_number,
      avatarUrl: s.avatar_url,
      status: s.Enrollment.status,
      enrolledAt: s.Enrollment.enrolled_at
    }));

    const sessionsFormatted = course.sessions.map(s => {
      const start = new Date(s.start_at);
      const end = new Date(s.end_at);
      const timeStr = `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')} - ${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`;
      
      return {
        id: s.id,
        title: s.title,
        date: start.toISOString().split('T')[0],
        time: timeStr,
        status: s.status,
        note: s.note
      };
    });

    res.json({
      id: course.id,
      title: course.title,
      subject: course.subject,
      tutor_name: course.tutor?.full_name,
      current_students: course.current_students,
      max_students: course.max_students,
      location: course.location,
      schedule_text: course.schedule_text,
      require_approval: course.require_approval,
      duration: duration,
      students: studentsFormatted,
      sessions: sessionsFormatted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy chi tiết lớp" });
  }
};

// ... (Giữ nguyên approveStudent, deleteCourse, getAllSessions, getMySchedule)

// --- 6. DUYỆT SINH VIÊN ---
export const approveStudent = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params; 
      const { studentId, action } = req.body; 
  
      const enrollment = await Enrollment.findOne({
        where: { course_id: id, student_id: studentId }
      });
  
      if (!enrollment) {
        await t.rollback();
        return res.status(404).json({ message: "Yêu cầu không tồn tại" });
      }
  
      if (action === "approve") {
        const course = await Course.findByPk(id, { transaction: t });
        
        if (course.current_students >= course.max_students) {
          await t.rollback();
          return res.status(400).json({ message: "Lớp đã đầy, không thể duyệt thêm" });
        }
        await Notification.create({
          user_id: studentId,
          title: "Yêu cầu được chấp nhận",
          message: `Giảng viên đã duyệt bạn vào lớp "${course.title}".`,
          type: "approval",
          data: { courseId: course.id }
        }, { transaction: t });
        enrollment.status = "active";
        await enrollment.save({ transaction: t });
        
        await course.increment("current_students", { transaction: t });
      } else {
        await enrollment.destroy({ transaction: t });
      }
  
      await t.commit();
      res.json({ message: "Thao tác thành công" });
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ message: "Lỗi duyệt sinh viên" });
    }
  };
  
  // --- 7. CẬP NHẬT LỚP HỌC (ĐÃ SỬA: UPDATE SCHEDULE TEXT) ---
  export const updateCourse = async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      // Bổ sung schedule_text vào body nhận
      let { 
        title, subject, max_students, location, 
        require_approval, reset_schedule, sessions, schedule_text 
      } = req.body;
      const tutorId = req.user.id;
  
      const course = await Course.findOne({ where: { id, tutor_id: tutorId } });
      if (!course) {
        await t.rollback();
        return res.status(404).json({ message: "Lớp không tồn tại hoặc bạn không có quyền" });
      }
  
      // Nếu có reset lịch, tính toán lại schedule_text
      if (reset_schedule && sessions && sessions.length > 0 && (!schedule_text || schedule_text.trim() === "")) {
         try {
          const timeStr = sessions[0].time || "00:00 - 00:00"; // ✅ ĐÃ SỬA: Lấy full chuỗi "08:00 - 09:30"
          const uniqueDays = [...new Set(sessions.map(s => {
            const date = new Date(s.date);
            const day = date.getDay();
            return day === 0 ? "CN" : `T${day + 1}`;
          }))].sort();
          schedule_text = `${uniqueDays.join(", ")} (${timeStr})`;
        } catch (e) {}
      }
  
      await course.update({
        title, subject, max_students, location, require_approval,
        ...(schedule_text && { schedule_text })
      }, { transaction: t });
  
      if (reset_schedule && sessions && sessions.length > 0) {
        await Session.destroy({ where: { course_id: id }, transaction: t });
  
        const sessionData = sessions.map(s => ({
          course_id: id,
          title: s.title,
          tutor_id: tutorId,
          start_at: new Date(`${s.date}T${s.time.split(" - ")[0]}`),
          end_at: new Date(`${s.date}T${s.time.split(" - ")[1]}`), 
          location: location || "Online",
          status: "upcoming"
        }));
  
        await Session.bulkCreate(sessionData, { transaction: t });
      }
  
      await t.commit();
      res.json({ message: "Cập nhật lớp thành công" });
  
    } catch (err) {
      await t.rollback();
      console.error(err);
      res.status(500).json({ message: "Lỗi cập nhật lớp" });
    }
  };
  
  // --- 8. XÓA LỚP HỌC ---
  export const deleteCourse = async (req, res) => {
    try {
      const { id } = req.params;
      const tutorId = req.user.id;
      const course = await Course.findOne({ where: { id, tutor_id: tutorId } });
  
      if (!course) {
        return res.status(404).json({ message: "Lớp không tồn tại hoặc bạn không có quyền xóa" });
      }
      
      await course.destroy();
      res.json({ message: "Đã xóa lớp học thành công" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi xóa lớp học" });
    }
  };
  
  // --- 9. LẤY LỊCH DẠY ---
  export const getAllSessions = async (req, res) => {
    try {
      const tutorId = req.user.id;
      const sessions = await Session.findAll({
        where: { tutor_id: tutorId },
        include: [
          { model: Course, as: "course", attributes: ["title", "location"] }
        ],
        order: [["start_at", "ASC"]]
      });
  
      const formatted = sessions.map(s => {
        const start = new Date(s.start_at);
        const end = new Date(s.end_at);
        const timeStr = `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')} - ${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`;
  
        return {
          id: s.id,
          title: s.title,
          courseName: s.course?.title,
          date: start.toISOString().split('T')[0], 
          time: timeStr, 
          location: s.location,
          status: s.status
        };
      });
  
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi lấy lịch dạy" });
    }
  };
  
  // --- 10. LẤY LỊCH HỌC ---
  export const getMySchedule = async (req, res) => {
    try {
      const studentId = req.user.id;
      const enrollments = await Enrollment.findAll({
        where: { student_id: studentId, status: "active" },
        attributes: ["course_id"]
    });
  
      const courseIds = enrollments.map(e => e.course_id);
      if (courseIds.length === 0) return res.json([]);
  
      const sessions = await Session.findAll({
        where: { course_id: courseIds },
        include: [
          { model: Course, as: "course", attributes: ["title"] },
          { model: User, as: "tutor", attributes: ["full_name"] }
        ],
        order: [["start_at", "ASC"]]
      });
  
      const formatted = sessions.map(s => {
        const start = new Date(s.start_at);
        const end = new Date(s.end_at);
        const timeStr = `${start.getHours().toString().padStart(2,'0')}:${start.getMinutes().toString().padStart(2,'0')} - ${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`;
  
        return {
          id: s.id,
          title: s.title, 
          courseName: s.course?.title, 
          tutorName: s.tutor?.full_name,
          date: start.toISOString().split('T')[0],
          time: timeStr,
          location: s.location,
          mode: s.location === "Online" ? "online" : "offline",
          status: s.status,
          course_id: s.course_id 
        };
      });
  
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Lỗi lấy lịch học" });
    }
  };

// --- 12. TẠO BIÊN BẢN MỚI ---
export const createCourseReport = async (req, res) => {
  try {
    const { id } = req.params;
    const tutorId = req.user.id;

    // 👇 Xóa 'homework' khỏi danh sách nhận
    const { 
      studentId, 
      topicsCovered, 
      comprehensionLevel, 
      progressNotes, 
      strengths ,
      areasForImprovement
    } = req.body;

    if (!studentId) return res.status(400).json({ message: "Thiếu ID học viên" });

    const newReport = await SessionReport.create({
      course_id: id,
      student_id: studentId,
      tutor_id: tutorId,
      
      topics_covered: topicsCovered || [],
      comprehension_level: comprehensionLevel || "good",
      progress_notes: progressNotes || "",
      strengths: strengths || [],
      areas_for_improvement: areasForImprovement || []
    });

    res.status(201).json({ message: "Tạo thành công", data: newReport });

  } catch (err) {
    console.error("Lỗi tạo biên bản:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// --- 2. SỬA HÀM LẤY DANH SÁCH (getCourseReports) ---
export const getCourseReports = async (req, res) => {
  try {
    const { id } = req.params; 
    const { studentId } = req.query;
    const reports = await SessionReport.findAll({
      where: { course_id: id, student_id: studentId },
      include: [{ model: Session, as: "session", attributes: ["start_at"] }],
      order: [["created_at", "DESC"]]
    });
    const formatted = reports.map(r => ({
      id: r.id,
      sessionDate: r.session ? r.session.start_at : r.created_at,
      sessionTime: r.session ? "Theo lịch" : new Date(r.created_at).toLocaleTimeString('vi-VN'),
      
      topicsCovered: r.topics_covered,
      comprehensionLevel: r.comprehension_level,
      progressNotes: r.progress_notes,
      strengths: r.strengths,
      areasForImprovement: r.areas_for_improvement,
      
      tutorSignedAt: r.createdAt
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy dữ liệu" });
  }
};
export const updateCourseReport = async (req, res) => {
  try {
    const { reportId } = req.params; // Lấy reportId từ URL
    const tutorId = req.user.id;
    const { 
      topicsCovered, 
      comprehensionLevel, 
      progressNotes, 
      strengths,
      areasForImprovement
    } = req.body;

    const report = await SessionReport.findByPk(reportId);
    if (!report) return res.status(404).json({ message: "Biên bản không tồn tại" });

    // Kiểm tra quyền: Chỉ người tạo (Tutor) mới được sửa
    if (report.tutor_id !== tutorId) {
      return res.status(403).json({ message: "Bạn không có quyền sửa biên bản này" });
    }

    // Cập nhật (Map từ CamelCase -> SnakeCase)
    await report.update({
      topics_covered: topicsCovered,
      comprehension_level: comprehensionLevel,
      progress_notes: progressNotes,
      strengths: strengths,
      areas_for_improvement: areasForImprovement
    });

    res.json({ message: "Cập nhật thành công", data: report });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật biên bản" });
  }
};

// --- 14. XÓA BIÊN BẢN ---
export const deleteCourseReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const tutorId = req.user.id;

    const report = await SessionReport.findByPk(reportId);
    if (!report) return res.status(404).json({ message: "Biên bản không tồn tại" });

    if (report.tutor_id !== tutorId) {
      return res.status(403).json({ message: "Bạn không có quyền xóa biên bản này" });
    }

    await report.destroy();
    res.json({ message: "Đã xóa biên bản" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi xóa biên bản" });
  }
};
export const updateSession = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const { title, date, time, reason } = req.body; 

    // 1. Tìm buổi học
    const session = await Session.findByPk(sessionId);
    if (!session) {
      await t.rollback();
      return res.status(404).json({ message: "Buổi học không tồn tại" });
    }

    if (session.tutor_id !== userId) {
      await t.rollback();
      return res.status(403).json({ message: "Không có quyền sửa" });
    }

    // --- SNAPSHOT GIÁ TRỊ CŨ ---
    const oldStart = session.start_at.getTime();
    const oldTitle = session.title; // Lưu title cũ để so sánh

    // --- TÍNH TOÁN GIÁ TRỊ MỚI ---
    let newStart = session.start_at;
    let newEnd = session.end_at;
    let newStatus = session.status;
    let newNote = session.note;
    
    // Logic tính thời gian (như cũ)
    if (date || time) {
        const dateStr = date || session.start_at.toISOString().split('T')[0];
        let timeStr = time;
        if (!timeStr) {
            const h = session.start_at.getHours().toString().padStart(2, '0');
            const m = session.start_at.getMinutes().toString().padStart(2, '0');
            timeStr = `${h}:${m}`;
        }
        newStart = new Date(`${dateStr}T${timeStr}`);
        const durationMs = new Date(session.end_at) - new Date(session.start_at);
        newEnd = new Date(newStart.getTime() + durationMs);
        
        if (newStart.getTime() !== oldStart) {
            newStatus = 'rescheduled';
            newNote = reason || session.note;
        }
    }

    // 2. Cập nhật Session
    await session.update({
      title: title || session.title,
      start_at: newStart,
      end_at: newEnd,
      status: newStatus,
      note: newNote
    }, { transaction: t });

    // --- 3. LOGIC GỬI THÔNG BÁO THÔNG MINH ---
    
    // Lấy danh sách sinh viên
    const course = await Course.findByPk(session.course_id, {
      include: [{
        model: User,
        as: 'students',
        through: { where: { status: 'active' } },
        attributes: ['id']
      }],
      transaction: t
    });

    if (course && course.students.length > 0) {
      const notifData = [];
      const newTitle = title || session.title;

      // CASE A: THAY ĐỔI THỜI GIAN (Ưu tiên cao - Màu Đỏ)
      if (newStart.getTime() !== oldStart) {
        course.students.forEach(student => {
          notifData.push({
            user_id: student.id,
            title: "📅 Lịch học thay đổi",
            message: `Buổi học "${newTitle}" đã dời sang ${newStart.toLocaleDateString('vi-VN')} ${time || session.time}.`,
            type: "schedule", // Frontend sẽ hiện màu đỏ
            data: { courseId: session.course_id },
            is_read: false
          });
        });
      } 
      // CASE B: CHỈ THAY ĐỔI CHỦ ĐỀ (Ưu tiên thấp - Màu Xanh/Xám)
      else if (title && title !== oldTitle) {
        course.students.forEach(student => {
          notifData.push({
            user_id: student.id,
            title: "✏️ Cập nhật nội dung",
            message: `Buổi học ngày ${newStart.toLocaleDateString('vi-VN')} đã cập nhật chủ đề thành: "${newTitle}".`,
            type: "system", // Frontend hiện màu xám/xanh (Info)
            data: { courseId: session.course_id },
            is_read: false
          });
        });
      }

      if (notifData.length > 0) {
        await Notification.bulkCreate(notifData, { transaction: t });
      }
    }

    await t.commit();
    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};
// 16. Lấy danh sách tài liệu
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.findAll({
      where: { course_id: req.params.id },
      order: [["created_at", "DESC"]]
    });
    res.json(docs);
  } catch (err) { res.status(500).json({ message: "Lỗi tải tài liệu" }); }
};

// 17. Upload tài liệu (Giả lập lưu Link, thực tế cần Multer)
export const createDocument = async (req, res) => {
  try {
    // req.body: { title, file_url }
    const newDoc = await Document.create({
      ...req.body,
      course_id: req.params.id,
      tutor_id: req.user.id
    });
    res.json(newDoc);
  } catch (err) { res.status(500).json({ message: "Lỗi tạo tài liệu" }); }
};

// ==========================================
// B. QUẢN LÝ BÀI TẬP (ASSIGNMENTS)
// ==========================================

// 18. Lấy danh sách bài tập (Kèm trạng thái nộp của Student)
export const getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params; // courseId

    const assignments = await Assignment.findAll({
      where: { course_id: id }, // Lưu ý: Bạn cần thêm cột course_id vào Model Assignment nếu chưa có
      include: [
        { 
          model: AssignmentSubmission, 
          as: "submissions",
          // Nếu là Student, chỉ lấy bài của mình. Nếu là Tutor, lấy hết.
          // Đây là logic đơn giản, để tối ưu nên xử lý kỹ hơn
        }
      ],
      order: [["deadline", "ASC"]]
    });

    res.json(assignments);
  } catch (err) { 
    console.log(err);
    res.status(500).json({ message: "Lỗi tải bài tập" }); 
  }
};

// 19. Tạo bài tập (Tutor)
export const createAssignment = async (req, res) => {
  try {
    await Assignment.create({
      ...req.body, // title, description, deadline
      course_id: req.params.id, // Lưu ý check Model có cột này chưa
      tutor_id: req.user.id
    });
    res.json({ message: "Đã tạo bài tập" });
  } catch (err) { res.status(500).json({ message: "Lỗi tạo bài tập" }); }
};

// 20. Nộp bài (Student)
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { file_url, content } = req.body;
    
    // Tìm bài nộp cũ hoặc tạo mới (Upsert)
    const [submission, created] = await AssignmentSubmission.findOrCreate({
      where: { assignment_id: assignmentId, student_id: req.user.id },
      defaults: { file_url, content }
    });

    if (!created) {
      await submission.update({ file_url, content, submitted_at: new Date() });
    }

    res.json({ message: "Nộp bài thành công" });
  } catch (err) { res.status(500).json({ message: "Lỗi nộp bài" }); }
};

// 21. Chấm điểm (Tutor)
export const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body; // Điểm số và nhận xét

    await AssignmentSubmission.update(
      { score, feedback, graded_at: new Date() },
      { where: { id: submissionId } }
    );

    // Có thể thêm logic gửi Notification cho sinh viên ở đây

    res.json({ message: "Đã chấm điểm" });
  } catch (err) { res.status(500).json({ message: "Lỗi chấm bài" }); }
};
// --- 22. GỬI PHẢN HỒI BUỔI HỌC ---
export const submitSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const studentId = req.user.id;
    const { rating, comment } = req.body;

    // 1. Kiểm tra session có tồn tại và đã hoàn thành chưa
    const session = await Session.findByPk(sessionId);
    if (!session) return res.status(404).json({ message: "Buổi học không tồn tại" });
    
    // (Optional) Chặn nếu chưa hoàn thành
    // if (session.status !== 'completed') return res.status(400).json({ message: "Buổi học chưa kết thúc" });

    // 2. Tạo hoặc Cập nhật Feedback (Mỗi SV chỉ đánh giá 1 lần/buổi)
    const [feedback, created] = await Feedback.findOrCreate({
      where: { session_id: sessionId, student_id: studentId },
      defaults: {
        tutor_id: session.tutor_id,
        rating,
        comment
      }
    });

    if (!created) {
      await feedback.update({ rating, comment });
    }

    // 3. (Nâng cao) Tính lại điểm trung bình cho Tutor ngay lập tức
    // const avg = await Feedback.aggregate('rating', { where: { tutor_id: session.tutor_id }, dataType: 'float', function: 'AVG' });
    // await Tutor.update({ rating_avg: avg }, { where: { user_id: session.tutor_id } });

    res.json({ message: "Gửi đánh giá thành công" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi gửi đánh giá" });
  }
};
// --- 23. ĐÁNH DẤU HOÀN THÀNH BUỔI HỌC ---
export const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findByPk(sessionId);
    if (!session) return res.status(404).json({ message: "Buổi học không tồn tại" });

    if (session.tutor_id !== userId) {
      return res.status(403).json({ message: "Bạn không có quyền" });
    }

    await session.update({ status: 'completed' });

    res.json({ message: "Đã đánh dấu hoàn thành buổi học" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};