// src/controllers/contact.controller.js
import { User, Role } from "../models/index.js";
import { Op } from "sequelize";

export async function getAvailableContacts(req, res) {
  try {
    const { userId } = req.params;

    const currentUser = await User.findByPk(userId, {
      include: [{ model: Role, attributes: ["name"] }],
    });
    if (!currentUser)
      return res.status(404).json({ error: "Không tìm thấy user" });

    const roleName = currentUser.role.name;
    let whereCondition = {};

    if (roleName === "admin") {
      // Admin có thể chat với tất cả
      whereCondition = { id: { [Op.ne]: userId } };
    } else if (roleName === "tutor") {
      // Tutor chỉ chat với admin hoặc student
      const adminRole = await Role.findOne({ where: { name: "admin" } });
      const studentRole = await Role.findOne({ where: { name: "student" } });
      whereCondition = {
        [Op.and]: [
          { id: { [Op.ne]: userId } },
          { role_id: { [Op.in]: [adminRole.id, studentRole.id] } },
        ],
      };
    } else {
      // Student chỉ chat với admin hoặc tutor
      const adminRole = await Role.findOne({ where: { name: "admin" } });
      const tutorRole = await Role.findOne({ where: { name: "tutor" } });
      whereCondition = {
        [Op.and]: [
          { id: { [Op.ne]: userId } },
          { role_id: { [Op.in]: [adminRole.id, tutorRole.id] } },
        ],
      };
    }

    const users = await User.findAll({
      where: whereCondition,
      attributes: ["id", "full_name", "email"],
      include: [{ model: Role, attributes: ["name"] }],
    });

    res.json(users);
  } catch (error) {
    console.error("❌ getAvailableContacts error:", error);
    res
      .status(500)
      .json({ error: "Không thể lấy danh sách người dùng khả dụng" });
  }
}
