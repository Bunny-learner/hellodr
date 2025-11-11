import { Doctor } from "../models/doctor.js";
import { redisPub } from '../db/redisconnect.js';

export const doctorConnections = new Map();

export default async function doctorSocket(io, socket, id, userConnections) {

  console.log(`👨‍⚕️ Doctor connected: ${socket.id} (User ID: ${id})`);

  userConnections.set(id, socket);

  try {
    const doctor = await Doctor.findById(id);
    if (doctor) {
      doctor.socketid = socket.id;
      await doctor.save();
      console.log(`✅ Saved socket for doctor: ${id}`);
    } else {
      console.log("❌ Doctor not found in DB");
    }
  } catch (err) {
    console.log("❌ Failed to store doctor socket ID", err);
  }


  socket.on("remove_patient", ({ roomid, appointmentId, doctorId, patientId }) => {
  io.to(roomid).emit("consultation_over", {
    appointmentId,
    doctorId,
    patientId,
  });
});




  socket.on("msg_fromdoc", ({ msg, roomid }) => {
    socket.to(roomid).emit("send_topat", msg);
  });


  socket.on("doctor_typing", ({ roomid }) => {
    socket.to(roomid).emit("doc_types", "doctor is typing");
  });


  socket.on("disconnect", () => {
    console.log(`❌ Doctor ${id} disconnected: ${socket.id}`);

    const old = doctorConnections.get(id);
    if (old && old.roomId) {
      roomPresence[old.roomId].doctor = false;
      socket.to(old.roomId).emit("presence_change", {
        who: "doctor",
        present: false
      });
    }

    doctorConnections.delete(id);
    userConnections.delete(id);
  });

}
