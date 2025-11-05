import { Doctor } from "../models/doctor.js";

export default async function doctorSocketHandler(io, socket, id, userConnections, redisSub) {
  console.log(`👨‍⚕️ Doctor connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket);

  // 2. Subscribe to their *private* channel
  const userChannel = `user:${id}`;
  redisSub.subscribe(userChannel, (err, count) => {
    if (err) {
      console.error(`[Redis] Failed to subscribe ${id}:`, err);
      return;
    }
    console.log(`[Redis] Subscribed ${id} to ${userChannel}.`);
  });



  const doc = await Doctor.findOne({ _id: id })
  if (!doc) {
    console.log("doctor not obtained from db")
    return;
  }
  doc.socketid = socket.id; // <-- This is unreliable and breaks on reload!
  await doc.save();

  socket.on("joinDoctorRoom", (doctorId) => {
    socket.join(`doctor_${doctorId}`);
    console.log(`Doctor ${doctorId} joined their room`);
  });
  // ... (rest of your chat logic) ...

  // 3. Clean up on disconnect
  socket.on("disconnect", () => {
    console.log(`[Handler] Doctor ${id} disconnected: ${socket.id}`);

    // Unsubscribe from their private channel
    redisSub.unsubscribe(userChannel);

    // Remove them from the Map
    userConnections.delete(id);

    console.log(`[Redis] Unsubscribed ${id} from ${userChannel}.`);
  });
}