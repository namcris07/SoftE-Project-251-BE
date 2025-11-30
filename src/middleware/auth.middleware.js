import jwt from "jsonwebtoken";
import { User, Role } from "../models/index.js";
export const auth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  next();
};
export const checkAdmin = async (req, res, next) => {
  try {
    // 1. Kiểm tra xem đã đăng nhập chưa
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Vui lòng đăng nhập trước" });
    }

    // 2. Tìm user và Role trong DB
    const user = await User.findByPk(req.user.id, {
      include: [{ model: Role, attributes: ["name"] }],
    });

    // 👇 DEBUG: Bật lên nếu vẫn lỗi để xem nó ra Role hay role
    // console.log("Debug User:", JSON.stringify(user, null, 2));

    // 3. Kiểm tra Role (SỬA Ở ĐÂY: Role -> role)
    // Sequelize trả về "role" vì trong model define là "role"
    if (!user || !user.role || user.role.name !== "admin") {
      return res.status(403).json({ 
        message: "Truy cập bị từ chối: Chỉ dành cho Quản trị viên (Admin)" 
      });
    }

    // 4. Hợp lệ -> Cho đi tiếp
    next();
  } catch (err) {
    console.error("❌ checkAdmin error:", err);
    res.status(500).json({ message: "Lỗi Server khi kiểm tra quyền" });
  }
};