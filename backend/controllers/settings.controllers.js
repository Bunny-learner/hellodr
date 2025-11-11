import { asynchandler } from "../utils/asynchandler.js";
import { Patient } from "../models/patient.js";
import { Doctor } from "../models/doctor.js";

const set_preferences = asynchandler(async (req, res) => {
  const { userId, role } = req;
  let { channels, reminderoffset } = req.body;
  console.log(reminderoffset)

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // ✅ Ensure channels is an array
  if (!Array.isArray(channels)) {
    channels = [];
  }

  
  const userModel = role === "doctor" ? Doctor : Patient;
  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  
  user.preferences = {
    ...(user.preferences || {}),
    channels,
    remindertime:reminderoffset,
  };

  await user.save();

  return res.json({
    success: true,
    message: "Preferences updated",
    preferences: user.preferences,
  });
});

export { set_preferences };
