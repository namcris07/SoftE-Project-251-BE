import express from "express";
import { listBookings, createBooking } from "../controllers/booking.controller.js";
import { auth, requireRole } from "../middleware/auth.middleware.js";
const router = express.Router();
router.get("/", auth, listBookings);
router.post("/", auth, requireRole("student","admin"), createBooking);
export default router;
