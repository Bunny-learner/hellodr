import { Patient } from "../models/patient.js";

export const patientConnections = new Map();

export default async function patientSocket(io, socket, id, userConnections) {
  console.log(`👤 Patient connected: ${socket.id} (User ID: ${id})`);

  // ✔ Store only socket
  userConnections.set(id, socket);

  try {
    const pat = await Patient.findById(id);
    if (pat) {
      // ✔ Only store socket.id in DB
      pat.socketid = socket.id;
      await pat.save();
      console.log(`✅ Saved socketId for patient: ${id}`);
    } else {
      console.log("❌ Patient not found in DB");
    }
  } catch (err) {
    console.log("❌ Failed to store patient socket ID", err);
  }

  socket.on("msg_frompat", ({ msg, roomid, patientId }) => {
    console.log(`💬 Patient(${patientId}) to room(${roomid}):`, msg);

    const payload = {
      msg,
      senderId: patientId,
      senderRole: "patient",
      roomid,
      timestamp: Date.now(),
    };

    socket.to(roomid).emit("sending", payload);
  });

  socket.on("patient_typing", ({ roomid }) => {
    socket.broadcast.to(roomid).emit("pat_types");
  });

  socket.on("disconnect", () => {
    console.log(`❌ Patient ${id} disconnected: ${socket.id}`);

    userConnections.delete(id);
    patientConnections.delete(id);
  });
}
