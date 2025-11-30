import express from "express";
import { login,loginSSO } from "../controllers/auth.controller.js";
const router = express.Router();
router.post("/login", login);
router.post("/login-sso", loginSSO); // Route mới
export default router;
