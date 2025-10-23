import express from "express";
import { User } from "../models/index.js";

const router = express.Router();

// GET all users
router.get("/", async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "full_name", "email", "role", "createdAt"],
      order: [["id", "ASC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
