import { Notification } from "../models/notification.js";
import { sendEmail } from "../utils/sendEmail.js";

export default function registerRedisListener(redisSub, userConnections, io) {
  console.log(" Redis global listener registered");

  redisSub.on("message", async (channel, message) => {
    
    // 1. Log the raw message string
    console.log("Raw Redis message received:", message); 

    let payload;
    try {
      // 2. Try to parse the message
      payload = JSON.parse(message);

    } catch (err) {
      // If parsing fails, log the error and the message that caused it
      console.error("REDIS JSON.PARSE ERROR!");
      console.error("The message string that failed to parse was:", message);
      console.error("Parse error:", err);
      return; // Stop processing this broken message
    }

    // 3. Process the parsed payload in its own try...catch
    try {
      const channelUserId = channel.split(":")[1]; 
      let notif;

      // 4. THE DEFENSIVE FIX:
      // Check if payload.data exists. If not, use the payload itself.
      const data = payload.data ? payload.data : payload;
      const type = payload.type ? payload.type : "default"; // Set a default type

      // 5. Use the new `data` and `type` variables from now on
      if (type !== "reminder") {
        notif = new Notification({
          doctorid: data.doctorid,
          patientid: data.patientid,
          appointmentid: data.appointmentid,
          message: data.message,
          from: data.from,
          to: data.to,
          isappointment: data.isappointment || false,
        });
        await notif.save();
      }

     let targetUserId =
  data.to === "doctor"
    ? data.doctorid
    : data.patientid;


targetUserId = targetUserId?.toString();
const targetSocket = userConnections.get(targetUserId);

if (!targetSocket) {
  console.log("⚠️ Target user not connected:", targetUserId);
  return;
}
const targetSocketId = targetSocket.id;

      if (type === "cancelled") {
        const appointment = data.appointment;

        const indiaTime = new Date(appointment.date).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        });

        const msg = `Dear ${appointment.patient.name}, your ${appointment.mode.toLowerCase()} appointment on ${indiaTime} has been cancelled due to doctor unavailability.`;

        await sendEmail(
          appointment.patient.email,
          "Appointment Cancelled",
          msg
        );
        return;
      }
      
      
      
      
      if (targetSocketId) {
        if (data.to === "patient") {
          io.to(targetSocketId).emit("patientnotification", data);
        } else {
          io.to(targetSocketId).emit("doctornotification", data);
        }

        if (type === "appointment:StatusChanged") {
          io.to(targetSocketId).emit("appointment:StatusChanged", {
            appointmentID: data.appointmentid,
            status: data.status,
          });
        }
      } else {
        console.log(
          ` User ${targetUserId} offline — notification saved only`
        );
      }
    } catch (err) {
      // This will catch errors like "Cannot read 'to' of undefined"
      console.error("Redis payload processing error:", err);
      // Log the payload that failed to be processed
      console.error("The payload that caused the error was:", payload); 
    }
  });
}