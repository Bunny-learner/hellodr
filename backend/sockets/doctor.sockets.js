import { Doctor } from "../models/doctor.js";
import { Appointment } from "../models/appointment.js";

export const doctorConnections = new Map();

export default async function doctorSocket(io, socket, id, userConnections) {
  console.log(`👨‍⚕️ Doctor connected: ${socket.id} (User ID: ${id})`);

  // ✔ Store ONLY socket object in memory
  userConnections.set(id, socket);

  try {
    const doctor = await Doctor.findById(id);
    if (doctor) {
      // ✔ Store only socket.id in DB (never store socket object)
      doctor.socketid = socket.id;
      await doctor.save();
      console.log(`✅ Saved socketId for doctor: ${id}`);
    } else {
      console.log("❌ Doctor not found in DB");
    }
  } catch (err) {
    console.log("❌ Failed to store doctor socket ID", err);
  }

  // ------------------------------------------------------
  // Doctor removes patient from consultation
  // ------------------------------------------------------
  socket.on("remove_patient", ({ roomid, appointmentId, doctorId, patientId }) => {
    io.to(roomid).emit("consultation_over", {
      appointmentId,
      doctorId,
      patientId,
    });
  });

  // ------------------------------------------------------
  // Doctor clicked join → enable join button for patient
  // ------------------------------------------------------
  socket.on("doctor_clicked_join", async ({ patientid, appt_id }) => {
    console.log("Enabling join for patient:", patientid);

    // Update appointment
    const appt = await Appointment.findById(appt_id);
    if (appt) {
      appt.patientjoinenabled = true;
      await appt.save();
      console.log("now patient is enabled to join the room ")
    }

    // Get patient's socket object
    const socket_patient = userConnections.get(patientid);

    if (!socket_patient) {
      console.log("⚠️ Patient not connected");
      return;
    }

    console.log("Found patient socket:", socket_patient.id);

    // Emit to patient
    socket_patient.emit("enable_join_button", { appt_id });
  });

  // ------------------------------------------------------
  // Doctor sends message
  // ------------------------------------------------------
  socket.on("msg_fromdoc", ({ msg, roomid, doctorId }) => {
    console.log(`💬 Doctor(${doctorId}) to room(${roomid}):`, msg);

    const payload = {
      msg,
      senderId: doctorId,
      senderRole: "doctor",
      roomid,
      timestamp: Date.now(),
    };

    socket.to(roomid).emit("sending", payload);
  });

  // ------------------------------------------------------
  // Doctor typing
  // ------------------------------------------------------
  socket.on("doctor_typing", ({ roomid }) => {
    socket.to(roomid).emit("doc_types");
  });

  // ------------------------------------------------------
  // Disconnect
  // ------------------------------------------------------
  socket.on("disconnect", () => {
    console.log(`❌ Doctor ${id} disconnected: ${socket.id}`);

    doctorConnections.delete(id);
    userConnections.delete(id);
  });
}
