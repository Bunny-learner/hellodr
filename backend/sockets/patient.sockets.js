import { Patient } from "../models/patient.js";

export default async function patientSocket(
  io,
  socket,
  id,
  userConnections
) {
  console.log(`👤 Patient connected: ${socket.id} (User ID: ${id})`);


  userConnections.set(id, socket);

  try {
    const pat = await Patient.findById(id);
    if (!pat) {
      console.log("❌ Patient not found in DB");
    } else {
      pat.socketid = socket.id;
      await pat.save();
      console.log(`✅ Saved socket for patient: ${id}`);
    }
  } catch (err) {
    console.log("❌ Failed to store patient socket ID", err);
  }

  
  socket.on("join_room", ({ roomid }) => {
    if (roomid) {
      socket.join(roomid);
      console.log(`✅ Patient ${id} joined room: ${roomid}`);
    }
  });


  socket.on("msg_frompat", ({ msg, roomid }) => {
    console.log(`💬 Patient says to room(${roomid}):`, msg);
    socket.to(roomid).emit("send_todoc", msg);
  });


  socket.on("disconnect", () => {
    console.log(`❌ Patient ${id} disconnected: ${socket.id}`);
    userConnections.delete(id);
  });
}
