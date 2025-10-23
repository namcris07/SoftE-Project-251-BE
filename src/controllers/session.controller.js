import { Session, User, Subject } from "../models/index.js";

export const listSessions = async (_req, res) => {
  const items = await Session.findAll({ include: [{ model: User, as: "tutor" }, Subject] });
  res.json(items);
};

export const createSession = async (req, res) => {
  const { tutor_id, subject_id, start_at, end_at, location, price_per_hour, total_price } = req.body;
  if (!tutor_id || !start_at || !end_at) return res.status(400).json({ message: "Missing required fields" });
  const s = await Session.create({ tutor_id, subject_id, start_at, end_at, location, price_per_hour, total_price });
  res.status(201).json(s);
};
