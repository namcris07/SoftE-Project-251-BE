import { Assignment } from "../models/index.js";

export const createAssignment = async (req, res) => {
  try {
    const { courseId, title, deadline } = req.body;
    
    await Assignment.create({
      course_id: courseId,
      tutor_id: req.user.id,
      title,
      deadline
    });

    res.status(201).json({ message: "Tạo bài tập thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi tạo bài tập" });
  }
};