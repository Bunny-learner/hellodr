import { Notification } from "../models/notification.js";
import { sendEmail } from "../utils/sendEmail.js";

export default function registerRedisListener(redisSub, userConnections, io) {
  console.log(" Redis global listener registered");

  redisSub.on("message", async (channel, message) => {
    console.log("📨 Redis message:", message);

    try {
      const payload = JSON.parse(message);
      const channelUserId = channel.split(":")[1]; // receiver by redis channel

      let notif;

      // SAVE NOTIFICATION ONLY IF NOT REMINDER
      if (payload.type !== "reminder") {
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

      // IMPORTANT — Determine actual target user
      let targetUserId =
        payload.data.to === "doctor"
          ? payload.data.doctorid
          : payload.data.patientid;

      const targetSocketId = userConnections.get(targetUserId?.toString());

      //  If appointment cancelled, send email
      if (payload.type === "cancelled") {
        const appointment = payload.data.appointment;

        const indiaTime = new Date(appointment.date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        const msg = `Dear ${appointment.patient.name}, your ${appointment.mode.toLowerCase()} appointment on ${indiaTime} has been cancelled due to doctor unavailability.`;

        await sendEmail(
          appointment.patient.email,
          "Appointment Cancelled",
          msg
        );
      }

      
      if (targetSocketId) {
        console.log("📨 Delivering socket to", targetUserId);

        if (payload.data.to === "patient") {
          io.to(targetSocketId).emit("patientnotification", payload.data);
        } else {
          io.to(targetSocketId).emit("doctornotification", payload.data);
        }


        if (payload.type === "appointment:StatusChanged") {
          io.to(targetSocketId).emit("appointment:StatusChanged", {
            appointmentID: payload.data.appointmentid,
            status: payload.data.status,
          });
        }
      } else {
        console.log(
          ` User ${targetUserId} offline — notification saved only`
        );
      }
    } catch (err) {
      console.log("Redis parse error:", err);
    }
  });
}
