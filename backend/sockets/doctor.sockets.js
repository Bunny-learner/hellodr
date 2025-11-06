import { Doctor } from "../models/doctor.js";
import { Notification } from "../models/notification.js";

export default async function doctorSocketHandler(io, socket, id, userConnections, redisSub) {
  console.log(`👨‍⚕️ Doctor connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket);

  const userChannel = `user:${id}`;

  // define a named handler
  const handleRedisMessage = async (channel, message) => {
    try {
      const parsed = JSON.parse(message);
      console.log(`[Redis] Message received on ${channel}:`, parsed.data);

      const userId = channel.split(":")[1];
      const userSocket = userConnections.get(userId);

      const notif = new Notification({
        doctorid: userId,
        patientid: parsed.data.patientid,
        appointmentid: parsed.appointmentid,
        orderid: parsed.orderid,
        message: parsed.data.message,
        from: parsed.data.from,
        to: "doctor",
        isappointment: parsed.isappointment || false,
      });

      await notif.save();
      console.log(`💾 Notification saved for doctor ${userId}`);

      if (userSocket) {
        userSocket.emit("notification", { msg: "got notification for doctor" });
        console.log(`📩 Sent notification to doctor ${userId}`);
      } else {
        console.log(`⚠️ No active socket for doctor ${userId}`);
      }
    } catch (err) {
      console.error("[Redis] Failed to handle message:", err);
    }
  };

 
  redisSub.off("message", handleRedisMessage);
  redisSub.on("message", handleRedisMessage);

  redisSub.subscribe(userChannel, (err) => {
    if (err) console.error(`[Redis] Failed to subscribe ${id}:`, err);
    else console.log(`[Redis] Subscribed ${id} to ${userChannel}.`);
  });

  const doc = await Doctor.findOne({ _id: id });
  if (!doc) return console.log("doctor not obtained from db");

  doc.socketid = socket.id;
  await doc.save();

  socket.join(doc.roomid);

  socket.on("msg_fromdoc", ({ msg, roomid }) => {
    console.log("doctor sent:", msg, roomid);
    socket.to(roomid).emit("send_topat", msg);
  });

  socket.on("disconnect", () => {
    console.log(`[Handler] Doctor ${id} disconnected: ${socket.id}`);
    redisSub.unsubscribe(userChannel);
    redisSub.off("message", handleRedisMessage); // clean up
    userConnections.delete(id);
    console.log(`[Redis] Unsubscribed ${id} from ${userChannel}.`);
  });
}
