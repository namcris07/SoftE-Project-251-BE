import { Booking, Session, User } from "../models/index.js";

export const listBookings = async (_req, res) => {
  const items = await Booking.findAll({ include: [Session, { model: User, as: "student" }] });
  res.json(items);
};

export const createBooking = async (req, res) => {
  const { session_id, student_id } = req.body;
  if (!session_id || !student_id) return res.status(400).json({ message: "Missing session_id or student_id" });
  const b = await Booking.create({ session_id, student_id, status: "pending" });
  res.status(201).json(b);
};
