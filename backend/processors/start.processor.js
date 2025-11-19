import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";
import { roomPresence } from "../sockets/index.js";
import {Doctor} from  "../models/doctor.js"

/**
 * startProcessor
 * Triggered by scheduled job when appointment start-time arrives
 *
 * ─ Logic ─
 * 1) If appointment not found → skip
 * 2) If status === "in_progress" (already started) → skip
 * 3) If doctor is already in the room (real-time check) → skip
 * 4) If status !== "accepted" (e.g., cancelled, completed) → skip
 * 5) Check if queue already active (DIFFERENT appointment in_progress)
 * → YES → send DELAY notice to patient
 * → NO  → promote this appointment → next_up
 */

export async function startProcessor(job) {
  try {
    const { appointmentId, doctorId, patientId } = job.data;

    console.log(
      `\n[startProcessor] → Running job for appointment: ${appointmentId}`
    );

  
    const appt = await Appointment.findById(appointmentId);

    if (!appt) {
      console.log(`[startProcessor] ❌ Appointment not found → skip`);
      return;
    }

    const currentStatus = (appt.status || "").toLowerCase();
    console.log(`[startProcessor] ✅ Promoting appointment → next_up`);

    appt.status = "next_up";
    await appt.save();
  
    if (currentStatus === "in_progress") {
      console.log(
        `[startProcessor] ⏭ Appointment already 'in_progress' (doctor joined early) → skip`
      );
      return;
    }
    // We assume the roomI(d is the appointmentId. Update if this is different.

    const temp = await Doctor.findById(doctorId)
    const roomId =temp.roomid; 
    const roomState = roomPresence?.[roomId] || null;

    if (roomState?.doctor === true) {
      console.log(
        `[startProcessor] ⏭ Doctor is already in the room (real-time check) → skip`
      );
      return;
    }

   
    if (currentStatus !== "accepted") {
      console.log(
        `[startProcessor] ⏭ Not eligible (status = ${currentStatus}, e.g., cancelled/completed) → skip`
      );
      return;
    }

    /* ------------------------------------------------------------------
     * (5) Check queue state for this doctor on SAME day
     * ------------------------------------------------------------------ */
    const startDay = new Date(appt.date);
    startDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startDay);
    nextDay.setDate(startDay.getDate() + 1);

    const activeAppointment = await Appointment.findOne({
      _id: { $ne: appointmentId }, // ⚠️ IMPORTANT: Exclude THIS appointment
      doctor: doctorId,
      date: { $gte: startDay, $lt: nextDay },
      status: { $in: ["next_up", "in_progress"] }, 
    });

    const doctorChannel = `user:${doctorId}`;
    const patientChannel = `user:${patientId}`;

    
    /* ------------------------------------------------------------------
 * 5) Check if doctor is ACTUALLY BUSY
 * ------------------------------------------------------------------ */

// (A) REAL-TIME CHECK — Doctor is inside room
if (roomState?.doctor === true) {
  console.log(`[startProcessor] ⏳ Doctor is inside room → send delay`);

  const doctorPayload = {
    type: "delay",
    data: {
      doctorid: doctorId,
      patientid: patientId,
      message: "Next patient is waiting, please end current consultation soon.",
      appointmentid: appointmentId,
      isappointment: true,
      from: "system",
      to: "doctor",
    },
  };

  const patientPayload = {
    type: "delay",
    data: {
      message:
        "The doctor is busy with another patient. Please wait, you will be notified soon.",
      doctorid: doctorId,
      patientid: patientId,
      appointmentid: appointmentId,
      isappointment: true,
      from: "system",
      to: "patient",
    },
  };

  await redisPub.publish(patientChannel, JSON.stringify(patientPayload));
  await redisPub.publish(doctorChannel, JSON.stringify(doctorPayload));
  return;
}

// (B) DB CHECK — Is ANY OTHER appointment in_progress?
const busyAppt = await Appointment.findOne({
  _id: { $ne: appointmentId },
  doctor: doctorId,
  status: "in_progress",
  date: { $gte: startDay, $lt: nextDay },
});

if (busyAppt) {
  console.log(
    `[startProcessor] ⏳ Doctor is busy with active appointment (${busyAppt._id}) → Delay`
  );

  const doctorPayload = {
    type: "delay",
    data: {
      doctorid: doctorId,
      patientid: patientId,
      message:
        "Next patient is waiting, please close the ongoing consultation soon.",
      appointmentid: appointmentId,
      isappointment: true,
      from: "system",
      to: "doctor",
    },
  };

  const patientPayload = {
    type: "delay",
    data: {
      message:
        "The doctor is busy with another appointment. Please wait for your turn.",
      doctorid: doctorId,
      patientid: patientId,
      appointmentid: appointmentId,
      isappointment: true,
      from: "system",
      to: "patient",
    },
  };

  await redisPub.publish(patientChannel, JSON.stringify(patientPayload));
  await redisPub.publish(doctorChannel, JSON.stringify(doctorPayload));
  return;
}

  } catch (err) {
    console.error(`[startProcessor] ❌ ERROR:`, err);
  }
}