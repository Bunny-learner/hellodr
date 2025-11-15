import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";

/**
 * timeoutProcessor (No-Show Detector)
 * Triggered by a scheduled job ~15-20 minutes AFTER start time.
 *
 * ─ Logic ─
 * Its only job is to find and cancel appointments that got "stuck"
 * and were never started by the doctor.
 *
 * 1) If appointment not found → skip
 * 2) If status IS 'in_progress', 'completed', 'cancelled' → skip
 * (This means the call started, finished, or was cancelled. Good!)
 *
 * 3) If status is STILL 'accepted' or 'next_up' → BAD!
 * (This is a "stuck" appointment. The patient is waiting,
 * the doctor never joined. It will block the queue.)
 *
 * 4) ACTION:
 * → Mark appointment as 'no_show' (or 'missed').
 * → Notify both doctor and patient that the appointment was missed.
 * → This un-sticks the queue for the next 'startProcessor' job.
 */
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

    
    const doctorPayload = {
      type: "appointment:statusChanged",
      data: {
        appointmentID: appointmentId,
        status: "no_show",
        message:
          "An appointment was missed (no one joined) and has been removed from your queue.",
      },
    };

    const patientPayload = {
      type: "missed",
      data: {
        message:
          "We are sorry, but your appointment was missed as the connection could not be established. Please contact the clinic to reschedule.",
        appointmentid: appointmentId,
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