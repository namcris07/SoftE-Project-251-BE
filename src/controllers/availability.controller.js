import { AvailabilitySlot } from "../models/index.js";

// --- Helpers Map ---
const DAY_TO_INT = { 
  "monday": 2, "tuesday": 3, "wednesday": 4, "thursday": 5, 
  "friday": 6, "saturday": 7, "sunday": 8 
};

const INT_TO_DAY = { 
  2: "monday", 3: "tuesday", 4: "wednesday", 5: "thursday", 
  6: "friday", 7: "saturday", 8: "sunday" 
};

// GET: Lấy lịch rảnh
export const getMySlots = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`🔍 [GET Slots] User ID: ${userId}`);

    const slots = await AvailabilitySlot.findAll({
      where: { tutor_id: userId },
      order: [["weekday", "ASC"], ["start_time", "ASC"]]
    });

    console.log(`✅ [DB Result] Found ${slots.length} slots raw.`);

    // Format dữ liệu trả về
    const formatted = slots.map(s => {
      const dayStr = INT_TO_DAY[s.weekday] || "monday";
      return {
        id: s.id,
        day: dayStr, // Trả về chữ thường (monday) để khớp FE
        start: s.start_time.slice(0, 5), // 08:00:00 -> 08:00
        end: s.end_time.slice(0, 5),
        location: "Online" // Tạm thời hardcode
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("❌ getMySlots error:", err);
    res.status(500).json({ message: "Lỗi lấy lịch rảnh" });
  }
};

// POST: Tạo lịch rảnh
export const createSlot = async (req, res) => {
  try {
    const { day, start, end, location } = req.body;
    const userId = req.user.id;

    console.log("📥 [Create Slot Request]:", { userId, day, start, end });
    
    // 1. Convert "monday" -> 2
    const cleanDay = day ? day.toLowerCase().trim() : "";
    const weekday = DAY_TO_INT[cleanDay];

    if (!weekday) {
      console.error("❌ Invalid Day:", day);
      return res.status(400).json({ message: "Ngày không hợp lệ" });
    }

    // 2. Tạo record
    const slot = await AvailabilitySlot.create({
      tutor_id: userId,
      weekday,
      start_time: start,
      end_time: end,
      is_recurring: true
    });

    console.log("✅ [Created Slot ID]:", slot.id);

    // 3. Trả về đúng format để Frontend add luôn vào list mà không cần F5
    res.status(201).json({ 
        id: slot.id, 
        day: cleanDay, // Trả lại y nguyên input chữ
        start, 
        end, 
        location 
    });
  } catch (err) {
    console.error("❌ createSlot error:", err);
    res.status(500).json({ message: "Lỗi tạo lịch rảnh" });
  }
};

// DELETE: Xóa lịch rảnh
export const deleteSlot = async (req, res) => {
  try {
    const { id } = req.params;
    await AvailabilitySlot.destroy({
      where: { id, tutor_id: req.user.id }
    });
    console.log(`🗑️ [Deleted Slot]: ${id}`);
    res.json({ message: "Đã xóa thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa lịch rảnh" });
  }
};