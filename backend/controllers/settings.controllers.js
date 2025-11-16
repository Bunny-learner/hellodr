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


/**
 * @desc    Subscribe user to web push notifications
 * @route   POST /settings/subscribe
 * @access  Private
 */
const subscribe_push = asynchandler(async (req, res) => {
  const { subscription } = req.body;

  const userId = req.user?._id; 

  if (!userId) {
    res.status(401);
    throw new Error("User not authenticated");
  }

  if (!subscription) {
    res.status(400);
    throw new Error("No subscription object provided");
  }


  let who=req.role=="doctor"?Doctor:Patient;

  try {
    const updatedUser = await who.findByIdAndUpdate(
      userId,
      {
        $set: { pushSubscription: subscription },
      },
      { new: true } 
    );

    if (!updatedUser) {
      res.status(404);
      throw new Error("User not found");
    }

    console.log(`User ${userId} as a ${req.role} subscribed to push notifications.`);

    // 4. Send a success response
    res.status(201).json({
      success: true,
      message: "User subscribed successfully.",
    });
      
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500);
    throw new Error("Failed to save subscription to database");
  }
});

export { set_preferences,subscribe_push };
