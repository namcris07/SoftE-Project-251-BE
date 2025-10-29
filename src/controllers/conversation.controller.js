// src/controllers/conversation.controller.js
import { sequelize } from "../config/database.js";

export async function getConversations(req, res) {
  try {
    const { userId } = req.params;

    const [rows] = await sequelize.query(
      `
      SELECT 
        CASE 
          WHEN m.student_id = :userId THEN m.tutor_id
          ELSE m.student_id
        END AS partner_id,
        u.full_name AS partner_name,
        MAX(m.created_at) AS last_time,
        SUBSTRING_INDEX(GROUP_CONCAT(m.content ORDER BY m.created_at DESC), ',', 1) AS last_message
      FROM messages m
      JOIN users u 
        ON u.id = CASE 
                    WHEN m.student_id = :userId THEN m.tutor_id
                    ELSE m.student_id
                  END
      WHERE :userId IN (m.student_id, m.tutor_id)
      GROUP BY partner_id, partner_name, u.id
      ORDER BY last_time DESC
      `,
      { replacements: { userId } }
    );

    res.json(rows);
  } catch (error) {
    console.error("❌ getConversations error:", error);
    res.status(500).json({ error: "Không thể lấy danh sách hội thoại" });
  }
}
