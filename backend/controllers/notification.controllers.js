import { asynchandler } from "../utils/asynchandler.js"
import dotenv from 'dotenv'
dotenv.config({ quiet: true })
import { Notification } from "../models/notification.js"


const get_notifications = asynchandler(async (req, res) => {
  try {

    console.log("inside get notifications")
    const {userId,role}=req
    console.log(role)

    let filter = { isread: false };

    if (role === "doctor") {
      filter = {
        to: "doctor",
        doctorid: userId,
        from: { $ne: "doctor" }, 
        isread: false
      };
    } else if (role === "patient") {
      filter = {
        to: "patient",
        patientid: userId,
        from: { $ne: "patient" },
        isread: false
      };
    }

    const unreadNotifications = await Notification.find(filter);
    const count = unreadNotifications.length;
    console.log(count)

    res.status(200).json({
      success: true,
      count,
      notifications: unreadNotifications
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



const get_allnotifications=asynchandler(async(req,res)=>{


  const {userId,role}=req

  let filter;
if (role === "doctor") {
      filter = {
        to: "doctor",
        doctorid: userId,
        from: { $ne: "doctor" }, 
      };
    } else if (role === "patient") {
      filter = {
        to: "patient",
        patientid: userId,
        from: { $ne: "patient" },
      };
    }

    try{

  const allNotifications = await Notification.find(filter);
  res.status(200).json({notifications:allNotifications})
    }
    catch{
      res.status(500).json({success:false,msg:"failed to fetch the notifications"})
    }
    


})


const markallread=asynchandler(async(req,res)=>{




  const {userId,role}=req

   let filter = { isread: false };
if (role === "doctor") {
      filter = {
        to: "doctor",
        doctorid: userId,
        from: { $ne: "doctor" }, 
        isread: false
      };
    } else if (role === "patient") {
      filter = {
        to: "patient",
        patientid: userId,
        from: { $ne: "patient" },
        isread: false
      };
    }

    await Notification.updateMany(
  filter,
  { $set: { isread: true } }
);

res.status(200).json({success:true})


})





const delete_notification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req;   // coming from auth middleware

    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Notification ID missing" });
    }

    // Ensure user owns this notification
    let filter = { _id: notificationId };

    if (role === "doctor") {
      filter.doctorid = userId;
    } else if (role === "patient") {
      filter.patientid = userId;
    }

    const deleted = await Notification.findOneAndDelete(filter);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found / Not authorized",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      deleted,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



const mark_read = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { userId, role } = req;   // coming from auth middleware

    if (!notificationId) {
      return res.status(400).json({ success: false, message: "Notification ID missing" });
    }

    // Ensure user owns this notification
    let filter = { _id: notificationId };

    if (role === "doctor") {
      filter.doctorid = userId;
    } else if (role === "patient") {
      filter.patientid = userId;
    }
 const updated = await Notification.findOneAndUpdate(
      filter,
      { $set: { isread: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or not owned by user",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked read",
      notification: updated,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export {get_notifications,get_allnotifications,delete_notification,markallread,mark_read}