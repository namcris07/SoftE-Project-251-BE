// src/routes/conversation.routes.js
import express from "express";
import { getConversations } from "../controllers/conversation.controller.js";

const router = express.Router();
router.get("/:userId", getConversations);
export default router;
