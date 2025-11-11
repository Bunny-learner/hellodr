import { Notification } from "../models/notification.js";
import { sendEmail } from "../utils/sendEmail.js"

export default function registerRedisListener(redisSub, userConnections) {
  console.log("✅ Redis global listener registered");

  redisSub.on("message", async (channel, message) => {
    console.log("message recieved:", message)
    try {
      const payload = JSON.parse(message);
      const userId = channel.split(":")[1];

      console.log(`📩 Redis → ${channel}:`, payload.data?.message);

      
      let notif;

      if (payload.type != "reminder" ) {

        notif = new Notification({
          doctorid: payload.data.doctorid,
          patientid: payload.data.patientid,
          appointmentid: payload.data.appointmentid,
          message: payload.data.message,
          from: payload.data.from,
          to: payload.data.to,
          isappointment: payload.data.isappointment || false,
        });

        await notif.save();
      }

     

      const socket = userConnections.get(userId);

      if (payload.type == "cancelled") {
        const appointment = payload.data.appointment;

        const indiaTime = new Date(appointment.date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        const msg = `Dear ${appointment.patient.name}, your ${appointment.mode.toLowerCase()} appointment on ${indiaTime} has been cancelled due to doctor unavailability.`

        await sendEmail(appointment.patient.email,"Appointment Cancelled",msg);


      }

      //for reminder not socket notifications comes becomes i took they will not be saved to db
      if (socket&&notif) {

        if(notif.from=="system"){

          if(notif.to=="patient")
            socket.emit("patientnotification", payload.data);
          else
            socket.emit("doctornotification", payload.data);


        }
        else if (notif.from == "patient")
          socket.emit("doctornotification", payload.data);
        else if (notif.from == "doctor")
          socket.emit("patientnotification", payload.data);

        console.log("📨 Delivered via socket");
      } else {
        console.log("⚠️ socket is not defined so the user is Offline; hence stored only in db");
      }
    } catch (err) {
      console.log("❌ Redis parse error", err);
    }
  });
}
