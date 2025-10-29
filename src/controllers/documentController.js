import { Document } from "../models/Document.js";
import path from "path";
import fs from "fs";
import { Op } from "sequelize";
import multer from "multer";

// GET /api/documents?search=&category=&type=
export const getDocuments = async (req, res) => {
  try {
    const { search = "", category = "all", type = "all" } = req.query;
    const whereClause = {
      status: "approved",
      access: "public"
    };

    if (category !== "all") whereClause.category = category;
    if (type !== "all") whereClause.type = type;

    // Tìm theo tiêu đề hoặc tác giả
    const docs = await Document.findAll({
      where: {
        ...whereClause,
        title: { [Op.like]: `%${search}%` },
      },
      order: [["upload_date", "DESC"]],
    });

    res.json(docs);
    } catch (err) {
    console.error("❌ Lỗi chi tiết:", err);
    res.status(500).json({ message: err.message });
  }

};

// GET /api/documents/:id
export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc || doc.access !== "public") {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

// GET /api/documents/:id/download
export const downloadDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc || doc.access !== "public") {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    // Tăng lượt tải
    doc.downloads += 1;
    await doc.save();

    // Giả sử file_path là đường dẫn trong server
    const filePath = path.resolve(`uploads/${doc.file_path}`);
    if (fs.existsSync(filePath)) {
      res.download(filePath, doc.title + path.extname(filePath));
    } else {
      res.status(404).json({ message: "File không tồn tại trên server" });
    }
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải file" });
  }
};
/// ⚙️ CẤU HÌNH MULTER (chỉ khai báo MỘT lần)
// ========================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage }).single("file");

// ========================
// 👩‍🏫 [1] Upload tài liệu
// ========================
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { title, description, category, type, access, tutorId } = req.body;

    const newDoc = await Document.create({
      title,
      description,
      category,
      type,
      access,
      tutor_id: tutorId || null,
      author: `Tutor #${tutorId}`,
      file_path: req.file.filename,
      size: (req.file.size / 1024 / 1024).toFixed(2) + "MB",
      status: "approved",
    });

    console.log("📤 File uploaded:", req.file.filename);
    return res.json({ message: "Upload success", document: newDoc });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    return res.status(500).json({ message: "Upload failed", error });
  }
};

export const getTutorDocuments = async (req, res) => {
  try {
    const docs = await Document.findAll({
      where: { tutor_id: req.params.tutorId },
    });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    await doc.destroy();
    res.json({ message: "Đã xóa tài liệu" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa", error: err.message });
  }
};

// 👩‍🏫 [3] Cập nhật tài liệu
export const updateDocument = async (req, res) => {
  try {
    const doc = await Document.findByPk(req.params.id);
    if (!doc) return res.status(404).json({ message: "Không tìm thấy tài liệu" });

    await doc.update(req.body);
    res.json({ message: "Cập nhật thành công", document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi cập nhật tài liệu" });
  }
};


