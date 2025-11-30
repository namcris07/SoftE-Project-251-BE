import { Message } from "../models/message.model.js";
import { User, Role } from "../models/index.js";
import { Op } from "sequelize";

// 1. API MỚI: Đếm tổng số tin nhắn chưa đọc (để hiện lên Icon quả chuông/tin nhắn)
export async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id;
    const count = await Message.count({
      where: {
        sender_id: { [Op.ne]: userId }, // Người gửi KHÔNG phải là mình
        [Op.or]: [{ student_id: userId }, { tutor_id: userId }], // Mình là người nhận
        is_read: false, // Chưa đọc
      },
    });
    res.json({ count });
  } catch (error) {
    console.error("❌ getUnreadCount error:", error);
    res.status(500).json({ count: 0 });
  }
}

// 2. Cập nhật: Lấy danh sách hội thoại kèm số tin chưa đọc của từng người
export async function getConversations(req, res) {
  try {
    const { userId } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [{ sender_id: userId }, { student_id: userId }, { tutor_id: userId }],
      },
      order: [["created_at", "DESC"]],
    });

    const conversationMap = new Map();

    for (const msg of messages) {
      // Xác định Partner ID
      let partnerId;
      const currentUserId = String(userId);
      const msgStudentId = String(msg.student_id);
      const msgTutorId = String(msg.tutor_id);

      if (currentUserId === msgStudentId) partnerId = msg.tutor_id;
      else if (currentUserId === msgTutorId) partnerId = msg.student_id;
      else partnerId = (String(msg.sender_id) === currentUserId) 
          ? (msgStudentId === currentUserId ? msg.tutor_id : msg.student_id)
          : msg.sender_id;

      // Logic gom nhóm
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, {
          partner_id: partnerId,
          last_message: msg.content,
          last_time: msg.created_at,
          unread: 0, 
        });
      }

      // ✅ Tính số tin chưa đọc từ partner này
      // Nếu tin này người gửi là Partner VÀ chưa đọc -> tăng biến đếm
      if (String(msg.sender_id) == String(partnerId) && !msg.is_read) {
         const conv = conversationMap.get(partnerId);
         conv.unread += 1;
      }
    }

    // (Phần lấy thông tin User giữ nguyên như cũ)
    const conversations = Array.from(conversationMap.values());
    const partnerIds = conversations.map((c) => c.partner_id);

    if (partnerIds.length > 0) {
      const partners = await User.findAll({
        where: { id: partnerIds },
        attributes: ["id", "full_name", "avatar_url", "role_id"],
        include: [{ model: Role, attributes: ["name"] }],
      });

      const result = conversations.map((conv) => {
        const userParams = partners.find((p) => p.id == conv.partner_id);
        return {
          ...conv,
          partner_name: userParams?.full_name || "Người dùng ẩn",
          avatar: userParams?.avatar_url || "",
          role: userParams?.role?.name || "member",
        };
      });
      return res.json(result);
    }
    return res.json([]);
  } catch (error) {
    console.error("❌ getConversations error:", error);
    res.status(500).json({ error: "Lỗi lấy danh sách" });
  }
}

// 3. Cập nhật: Lấy tin nhắn chi tiết VÀ Đánh dấu là đã đọc
export async function getMessages(req, res) {
  try {
    const { student_id, tutor_id } = req.params;
    const currentUserId = req.user.id;

    // Lấy tin nhắn
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { student_id, tutor_id },
          { student_id: tutor_id, tutor_id: student_id },
        ],
      },
      order: [["created_at", "ASC"]],
    });

    // ✅ Đánh dấu đã đọc các tin nhắn do đối phương gửi
    await Message.update(
      { is_read: true },
      {
        where: {
          [Op.or]: [
            { student_id, tutor_id },
            { student_id: tutor_id, tutor_id: student_id },
          ],
          sender_id: { [Op.ne]: currentUserId }, // Chỉ update tin người khác gửi mình
          is_read: false,
        },
      }
    );

    res.json(messages);
  } catch (error) {
    console.error("❌ getMessages error:", error);
    res.status(500).json({ error: "Lỗi lấy tin nhắn" });
  }
}

// 4. Giữ nguyên sendMessage
export async function sendMessage(req, res) {
  // ... (Code cũ giữ nguyên)
  try {
    const { student_id, tutor_id, sender_id, content } = req.body;
    if (!sender_id || !content) return res.status(400).json({ error: "Thiếu dữ liệu" });
    const finalStudent = student_id ?? sender_id;
    const finalTutor = tutor_id ?? sender_id;

    const message = await Message.create({
      student_id: finalStudent,
      tutor_id: finalTutor,
      sender_id,
      content,
      is_read: false // Mặc định chưa đọc
    });
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: "Lỗi gửi tin" });
  }
}