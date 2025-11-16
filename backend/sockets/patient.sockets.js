import { Patient } from "../models/patient.js";


export const patientConnections = new Map();

export default async function patientSocket(
  io,
  socket,
  id,
  userConnections
) {
  console.log(`👤 Patient connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket.id);

  try {
    const pat = await Patient.findById(id);
    if (pat) {
      pat.socketid = socket.id;
      await pat.save();
      console.log(`✅ Saved socket for patient: ${id}`);
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

    const old = patientConnections.get(id);
    if (old && old.roomId) {
      roomPresence[old.roomId].patient = false;
      socket.to(old.roomId).emit("presence_change", {
        who: "patient",
        present: false
      });
    }

    patientConnections.delete(id);
    userConnections.delete(id);
  });
}
