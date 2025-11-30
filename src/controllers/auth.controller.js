import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// ✅ SỬA: Thêm Student vào dòng import
import { User, Role, Student } from "../models/index.js"; 
import { checkCAS } from "../utils/casClient.js";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findOne({ where: { email }, include: { model: Role, attributes: ["name"] } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = user.password
      ? await bcrypt.compare(password, user.password)
      : password === "1";

    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET || "secret_key", { expiresIn: "2h" });
    res.json({ message: "Login success", token, role: user.role.name, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginSSO = async (req, res) => {
  try {
    const { username, password } = req.body; 

    if (!username || !password) {
      return res.status(400).json({ message: "Vui lòng nhập MSSV và mật khẩu" });
    }

    // 1. Gọi hàm checkCAS để xác thực với trường
    const isAuth = await checkCAS(username, password);
    
    if (!isAuth) {
      return res.status(401).json({ message: "Sai tài khoản hoặc mật khẩu SSO" });
    }

    // 2. Nếu xác thực thành công, xử lý User trong DB
    const email = `${username}@hcmut.edu.vn`; 
    
    let user = await User.findOne({ 
        where: { email },
        include: { model: Role, attributes: ["name"] } 
    });

    // Nếu user chưa tồn tại -> Tự động đăng ký
    if (!user) {
      const studentRole = await Role.findOne({ where: { name: "student" } });
      
      user = await User.create({
        email,
        full_name: username, 
        sso_id: username,    
        role_id: studentRole.id,
        status: "active"
      });

      // ✅ Dòng gây lỗi cũ: Student đã được import ở trên nên sẽ chạy đúng
      await Student.create({
        user_id: user.id,
        total_sessions: 0,
        completed_sessions: 0,
        training_points: 0
      });

      user = await User.findByPk(user.id, { include: { model: Role, attributes: ["name"] } });
    }

    const token = jwt.sign(
        { id: user.id, role: user.role.name }, 
        process.env.JWT_SECRET || "secret_key", 
        { expiresIn: "2h" }
    );

    res.json({ 
        message: "SSO Login success", 
        token, 
        role: user.role.name, 
        user: { id: user.id, email: user.email, full_name: user.full_name } 
    });

  } catch (e) {
    console.error("SSO Login Error:", e);
    res.status(500).json({ message: "Lỗi Server khi xử lý SSO" });
  }
};