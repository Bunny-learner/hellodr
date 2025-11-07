import { Notification } from "../models/notification.js";

export default function registerRedisListener(redisSub, userConnections) {
  console.log("✅ Redis global listener registered");

  redisSub.on("message", async (channel, message) => {
    try {
      const payload = JSON.parse(message);
      const userId = channel.split(":")[1];  

      console.log(`📩 Redis → ${channel}:`, payload.data?.message);

      
      const notif = new Notification({
        doctorid: payload.data.doctorid,
        patientid: payload.data.patientid,
        appointmentid: payload.data.appointmentid,
        message: payload.data.message,
        from: payload.data.from,
        to: payload.data.to,
        isappointment: payload.data.isappointment || false,
      });

      await notif.save();

      const socket = userConnections.get(userId);
      if (socket) {
        if(notif.from == "patient")
        socket.emit("doctornotification", payload.data);
        else if(notif.from =="doctor")
        socket.emit("patientnotification", payload.data);
        
        console.log("📨 Delivered via socket");
      } else {
        console.log("⚠️ Offline; stored only");
      }
    } catch (err) {
      console.log("❌ Redis parse error", err);
    }
  });
}
