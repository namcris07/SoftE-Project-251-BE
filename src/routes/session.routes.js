import express from "express";
import { listSessions, createSession } from "../controllers/session.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/", auth, listSessions);
router.post("/", auth, requireRole("tutor","admin"), createSession);
export default router;
