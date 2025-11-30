import express from "express";
import { 
  getMessages, 
  sendMessage, 
  getConversations,
  getUnreadCount // ✅ Import thêm
} from "../controllers/message.controller.js";
import { auth } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/unread-count", auth, getUnreadCount); // ✅ API lấy số lượng Badge
router.get("/conversations/:userId", auth, getConversations);
router.get("/:student_id/:tutor_id", auth, getMessages);
router.post("/", auth, sendMessage);

export default router;