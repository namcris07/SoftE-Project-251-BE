// src/routes/message.routes.js
import express from "express";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/:student_id/:tutor_id", getMessages);
router.post("/", sendMessage);

export default router;
