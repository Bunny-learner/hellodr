import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";
export async function timeoutProcessor(job) {
  try {
    const { appointmentId, doctorId, patientId } = job.data;

    console.log(
      `\n[timeoutProcessor] → Checking "stuck" status for appt: ${appointmentId}`
    );

    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      console.log(`[timeoutProcessor] ❌ Appointment not found → skip`);
      return;
    }

    const currentStatus = (appt.status || "").toLowerCase();

    /* ------------------------------------------------------------------
     * (2) "Happy Path" Check
     * ------------------------------------------------------------------ */
    const handledStatuses = ["in_progress", "completed", "cancelled", "no_show"];
    if (handledStatuses.includes(currentStatus)) {
      console.log(
        `[timeoutProcessor] ⏹ Appt=${appointmentId} already handled (status=${currentStatus}) → skipping`
      );
      return;
    }

    /* ------------------------------------------------------------------
     * (3) "Stuck" Appointment Check
     * ------------------------------------------------------------------ */
    // If we are here, status is 'accepted' or 'next_up'.
    // This is a "stuck" call that never started.
    console.log(
      `[timeoutProcessor] ⚠️ Appt=${appointmentId} is STUCK (status=${currentStatus}). Marking as 'no_show'.`
    );

    /* ------------------------------------------------------------------
     * (4) ACTION: Mark as 'no_show' and notify
     * ------------------------------------------------------------------ */
    appt.status = "no_show"; // Or "missed", "auto_cancelled"
    await appt.save();

    const doctorChannel = `user:${doctorId}`;
    const patientChannel = `user:${patientId}`;

    // --- THIS IS THE FIX ---
    // You must define the payloads before using them.

    // 1. Define the payload for the DOCTOR
    const doctorPayload = {
      type: "appointment:StatusChanged", // Use a relevant type
      data: {
        message: `Appointment with patient ${patientId} was missed and automatically marked 'no_show'.`,
        appointmentid: appt._id,
        status: appt.status, // "no_show"
        doctorid: doctorId,
        patientid: patientId,
        isappointment: true,
        from: "system",
        to: "doctor",
      },
    };

    // 2. Define the payload for the PATIENT
    const patientPayload = {
      type: "appointment:StatusChanged", // Use a relevant type
      data: {
        message: `Your appointment was missed as the doctor did not join in time. It has been marked 'no_show'.`,
        appointmentid: appt._id,
        status: appt.status, // "no_show"
        doctorid: doctorId,
        patientid: patientId,
        isappointment: true,
        from: "system",
        to: "patient",
      },
    };
    

    await redisPub.publish(doctorChannel, JSON.stringify(doctorPayload));
    await redisPub.publish(patientChannel, JSON.stringify(patientPayload));

    console.log(
      `[timeoutProcessor] ✅ "no_show" broadcast complete for ${appointmentId}\n`
    );
  } catch (err) {
    console.error(`[timeoutProcessor] ❌ ERROR:`, err);
  }
}