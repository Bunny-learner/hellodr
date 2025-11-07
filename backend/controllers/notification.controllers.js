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



const getallnotifications=asynchandler(async(req,res)=>{


  
  const {userId,role}=req

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



export {get_notifications,markallread}