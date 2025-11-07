import { Doctor } from "../models/doctor.js";

export default async function doctorSocket(
  io,
  socket,
  id,
  userConnections
) {
  console.log(`👨‍⚕️ Doctor connected: ${socket.id} (User ID: ${id})`);

  
  userConnections.set(id, socket);

  
  try {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      console.log("❌ Doctor not found in DB");
    } else {
      doctor.socketid = socket.id;
      await doctor.save();

      
      if (doctor.roomid) {
        socket.join(doctor.roomid);
        console.log(`✅ Doctor ${id} joined room: ${doctor.roomid}`);
      }

      console.log(`✅ Saved socket for doctor: ${id}`);
    }
  } catch (err) {
    console.log("❌ Failed to store doctor socket ID", err);
  }

  
  socket.on("msg_fromdoc", ({ msg, roomid }) => {
    console.log("💬 doctor sent:", msg, roomid);
    socket.to(roomid).emit("send_topat", msg);
  });

  
  socket.on("disconnect", () => {
    console.log(`❌ Doctor ${id} disconnected: ${socket.id}`);
    userConnections.delete(id);
  });
}
