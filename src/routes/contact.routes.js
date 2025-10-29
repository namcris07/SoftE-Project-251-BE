import express from "express";
import { Op } from "sequelize";
import { User, Role } from "../models/index.js";

const router = express.Router();

// ✅ Lấy tất cả người dùng khác để bắt đầu chat
router.get("/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;

    const users = await User.findAll({
      where: { id: { [Op.ne]: user_id } }, // loại bỏ chính mình
      attributes: ["id", "full_name", "email"],
      include: [
        {
          model: Role,
          attributes: ["name"],
        },
      ],
      order: [["full_name", "ASC"]],
    });

    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi load contacts:", err);
    res.status(500).json({ error: "Không thể tải danh sách người dùng" });
  }
});

export default router;
