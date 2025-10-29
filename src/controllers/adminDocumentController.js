import { Document } from "../models/Document.js";
import { Op } from "sequelize";

// ===========================
// 👑 [1] Xem tất cả tài liệu
// ===========================
export const getAllDocuments = async (req, res) => {
  try {
    const { status, keyword } = req.query;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (keyword) whereClause.title = { [Op.like]: `%${keyword}%` };

    const docs = await Document.findAll({
      where: whereClause,
      order: [["upload_date", "DESC"]],
    });

    if (!docs.length)
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    res.status(200).json(docs);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách tài liệu:", error);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách tài liệu" });
  }
};


// ======================================
// 👑 [2] Duyệt tài liệu (status = approved)
// ======================================
export const approveDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);

    if (!doc)
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    await doc.update({ status: "approved" });

    res.status(200).json({
      message: "Tài liệu đã được duyệt thành công",
      document: doc,
    });
  } catch (error) {
    console.error("❌ Lỗi khi duyệt tài liệu:", error);
    res.status(500).json({ message: "Lỗi server khi duyệt tài liệu" });
  }
};

// ======================================
// 👑 [3] Từ chối tài liệu (status = rejected)
// ======================================
export const rejectDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);

    if (!doc)
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    await doc.update({ status: "rejected" });

    res.status(200).json({
      message: "Tài liệu đã bị từ chối",
      document: doc,
    });
  } catch (error) {
    console.error("❌ Lỗi khi từ chối tài liệu:", error);
    res.status(500).json({ message: "Lỗi server khi từ chối tài liệu" });
  }
};
export const getDocumentStats = async (req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      Document.count({ where: { status: "pending" } }),
      Document.count({ where: { status: "approved" } }),
      Document.count({ where: { status: "rejected" } }),
    ]);

    res.status(200).json({ pending, approved, rejected });
  } catch (error) {
    console.error("❌ Lỗi khi thống kê tài liệu:", error);
    res.status(500).json({ message: "Lỗi server khi thống kê" });
  }
};
