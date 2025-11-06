import { Patient } from "../models/patient.js";
import { Notification } from "../models/notification.js";

export default async function patientSocketHandler(io, socket, id, userConnections, redisSub) {
  console.log(`👨 Patient connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket);

  const userChannel = `user:${id}`;


  const handleRedisMessage = async (channel, message) => {
    try {
      const parsed = JSON.parse(message);
      console.log(`[Redis] Message received on ${channel}:`, parsed.data);

      const userId = channel.split(":")[1];
      const userSocket = userConnections.get(userId);

      const notif = new Notification({
        patientid: userId,
        doctorid: parsed.data.doctorid,
        appointmentid: parsed.appointmentid,
        orderid: parsed.orderid,
        message: parsed.data.message,
        from: parsed.data.from,
        to: "patient",
        isappointment: parsed.isappointment || false,
      });

      await notif.save();
      console.log(`💾 Notification saved for patient ${userId}`);

      if (userSocket) {
        userSocket.emit("notification", { msg: "got notification for patient" });
        console.log(`📩 Sent notification to patient ${userId}`);
      } else {
        console.log(`⚠️ No active socket for patient ${userId}`);
      }
    } catch (err) {
      console.error("[Redis] Failed to handle message:", err);
    }
  };

  
  redisSub.off("message", handleRedisMessage);


  redisSub.subscribe(userChannel, (err) => {
    if (err) console.error(`[Redis] Failed to subscribe ${id}:`, err);
    else console.log(`[Redis] Subscribed ${id} to ${userChannel}.`);
  });

  redisSub.on("message", handleRedisMessage);

  
  const pat = await Patient.findById(id);
  if (!pat) return console.log("Patient not found in DB");

  pat.socketid = socket.id;
  await pat.save();
  console.log(`Socket ID saved for patient: ${pat._id}`);

  
  socket.on("join_room", ({ roomid }) => {
    if (roomid) {
      socket.join(roomid);
      console.log(`Socket ${socket.id} joined room ${roomid}`);
    }
  });

  socket.on("msg_frompat", ({ msg, roomid }) => {
    console.log("patient sent:", msg, roomid);
    socket.to(roomid).emit("send_todoc", msg);
  });

  socket.on("disconnect", () => {
    console.log(`[Handler] Patient ${id} disconnected: ${socket.id}`);

    redisSub.unsubscribe(userChannel);
    redisSub.off("message", handleRedisMessage); // clean up
    userConnections.delete(id);

    console.log(`[Redis] Unsubscribed ${id} from ${userChannel}.`);
  });
}
