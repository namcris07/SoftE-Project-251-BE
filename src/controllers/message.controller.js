import { Message } from "../models/message.model.js";
import { Op } from "sequelize";

export async function getMessages(req, res) {
  try {
    const { student_id, tutor_id } = req.params;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { student_id, tutor_id },
          { student_id: tutor_id, tutor_id: student_id },
        ],
      },
      order: [["created_at", "ASC"]],
    });

    res.json(messages);
  } catch (error) {
    console.error("❌ getMessages error:", error);
    res.status(500).json({ error: "Không thể lấy danh sách tin nhắn" });
  }
}

export async function sendMessage(req, res) {
  try {
    const { student_id, tutor_id, sender_id, content } = req.body;

    if (!sender_id || !content)
      return res.status(400).json({ error: "Thiếu dữ liệu cần thiết" });

    // ✅ Cho phép admin chat với mọi người
    const finalStudent = student_id ?? sender_id;
    const finalTutor = tutor_id ?? sender_id;

    const message = await Message.create({
      student_id: finalStudent,
      tutor_id: finalTutor,
      sender_id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("❌ sendMessage error:", error);
    res.status(500).json({ error: "Không thể gửi tin nhắn" });
  }
}
