import { Patient } from "../models/patient.js";

export default async function patientSocketHandler(io, socket, id, userConnections, redisSub) {
  console.log(`👨 patient connected: ${socket.id} (User ID: ${id})`);

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


 const pat = await Patient.findById(id);

    if (!pat) {
      console.log("❌ Patient not found in DB");
      return;
    }

   
    pat.socketid = socket.id;
    await pat.save();
    console.log(`✅ Socket ID saved for patient: ${pat._id}`);

   
  // 3. Clean up on disconnect
  socket.on("disconnect", () => {
    console.log(`[Handler] Patient ${id} disconnected: ${socket.id}`);

    // Unsubscribe from their private channel
    redisSub.unsubscribe(userChannel);

    // Remove them from the Map
    userConnections.delete(id);

    console.log(`[Redis] Unsubscribed ${id} from ${userChannel}.`);
  });
}