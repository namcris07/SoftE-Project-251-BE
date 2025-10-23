import bcrypt from "bcrypt";
import { User, Role } from "../models/index.js";

export const getAllUsers = async (_req, res) => {
  const users = await User.findAll({ include: { model: Role } });
  res.json(users);
};

export const createUser = async (req, res) => {
  const { email, full_name, password, roleName } = req.body;
  if (!email || !full_name || !password || !roleName) return res.status(400).json({ message: "Missing fields" });
  const role = await Role.findOne({ where: { name: roleName } });
  if (!role) return res.status(400).json({ message: "Invalid role" });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, full_name, password: hash, roleId: role.id });
  res.status(201).json({ id: user.id });
};
