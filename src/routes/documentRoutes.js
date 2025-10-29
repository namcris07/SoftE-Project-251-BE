import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getDocuments,
  getTutorDocuments,
  deleteDocument,
} from "../controllers/documentController.js";
import { Document } from "../models/Document.js";
import { fileURLToPath } from "url";
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ⚙️ Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ✅ API upload file
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, description, category, type, access, tutorId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "❌ Không có file được tải lên!" });

    // Tạo record trong MySQL
    const newDoc = await Document.create({
      title: title || file.originalname,
      description: description || "",
      author: `Tutor #${tutorId}`,
      tutor_id: tutorId,
      file_path: file.filename,
      type: type || path.extname(file.originalname).replace(".", ""),
      category: category || "lecture",
      size: (file.size / 1024 / 1024).toFixed(2) + "MB",
      access: access || "public",
      status: "approved",
    });

    res.json({ message: "📤 Upload thành công!", document: newDoc });
  } catch (err) {
    console.error("❌ Lỗi upload:", err);
    res.status(500).json({ message: "Lỗi khi upload tài liệu", error: err.message });
  }
});

// ✅ Lấy toàn bộ tài liệu
router.get("/", getDocuments);

// ✅ Lấy tài liệu riêng của tutor
router.get("/mine/:tutorId", getTutorDocuments);

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);

    if (!doc) {
      console.warn("⚠️ Không tìm thấy tài liệu trong DB:", id);
      return res.status(404).json({ message: "Tài liệu không tồn tại" });
    }

    // ✅ Xác định đường dẫn tuyệt đối đến file upload
    const filePath = path.resolve(__dirname, "../uploads", doc.file_path);
    console.log("🔍 Đường dẫn file cần xóa:", filePath);

    // ✅ Kiểm tra và xóa file nếu tồn tại
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("🗑️ Đã xóa file:", filePath);
    } else {
      console.warn("⚠️ File không tồn tại:", filePath);
    }

    // ✅ Xóa record trong DB
    await doc.destroy();
    console.log("✅ Đã xóa record trong DB:", doc.title);

    res.json({ message: "Đã xóa tài liệu thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa tài liệu:", error);
    res.status(500).json({ message: "Lỗi khi xóa tài liệu", error });
  }
});

router.put("/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findByPk(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.downloads = (doc.downloads || 0) + 1;
    await doc.save();

    res.json({ message: "Download count updated", downloads: doc.downloads });
  } catch (error) {
    console.error("❌ Error updating download:", error);
    res.status(500).json({ message: "Error updating download", error });
  }
});
export default router;
