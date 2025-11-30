import { Notification } from "../models/index.js";

// Lấy danh sách
export const getNotifications = async (req, res) => {
  try {
    const notifs = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit: 50
    });
    res.json(notifs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy thông báo" });
  }
};

// Đọc thông báo
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const where = { user_id: req.user.id };
    if (id !== 'all') where.id = id;
    
    await Notification.update({ is_read: true }, { where });
    res.json({ message: "Đã đọc" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi cập nhật" });
  }
};

// Xóa thông báo
export const deleteNotification = async (req, res) => {
  try {
    await Notification.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    res.json({ message: "Đã xóa" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa" });
  }
};