// routes/course.routes.js
import express from "express";
import { auth } from "../middleware/auth.middleware.js"; // Middleware check login
import { 
  getCourses, 
  createCourse, 
  registerCourse, 
  cancelRegistration,
  getCourseDetail,
  approveStudent,
  updateCourse, // <--- Import mới
  deleteCourse,
  getAllSessions,
  getMySchedule,getCourseReports,
  createCourseReport,
  updateCourseReport,
  deleteCourseReport,
  updateSession,
  getDocuments,
  createDocument,
  getAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  submitSessionFeedback,
  completeSession
} from "../controllers/courseController.js";

const router = express.Router();

router.get("/", auth, getCourses);
router.post("/", auth, createCourse);
router.get("/sessions", auth, getAllSessions);
router.get("/schedule", auth, getMySchedule);
router.get("/:id", auth, getCourseDetail);
router.put("/:id", auth, updateCourse);    // <--- Route Sửa
router.delete("/:id", auth, deleteCourse); // <--- Route Xóa
router.post("/:id/register", auth, registerCourse);
router.post("/:id/cancel", auth, cancelRegistration);
router.post("/:id/approve", auth, approveStudent);
router.get("/:id/reports", auth, getCourseReports);
router.post("/:id/reports", auth, createCourseReport);
router.put("/reports/:reportId", auth, updateCourseReport);
router.delete("/reports/:reportId", auth, deleteCourseReport);
router.put("/sessions/:sessionId/reschedule", auth, updateSession);
router.get("/:id/documents", auth, getDocuments);
router.post("/:id/documents", auth, createDocument);
router.get("/:id/assignments", auth, getAssignments);
router.post("/:id/assignments", auth, createAssignment);
router.post("/assignments/:assignmentId/submit", auth, submitAssignment);
router.post("/assignments/:assignmentId/grade", auth, gradeSubmission);
router.post("/sessions/:sessionId/feedback", auth, submitSessionFeedback);
router.put("/sessions/:sessionId/complete", auth, completeSession);
export default router;