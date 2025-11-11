import { Appointment } from "../models/appointment.js";
import { redisPub } from "../db/redisconnect.js";

/**
 * startProcessor
 * Triggered by scheduled job when appointment start-time arrives
 *
 * ─ Logic ─
 * 1) If appointment not found → skip
 * 2) If status !== "accepted" → skip
 * 3) Check if queue already active (someone next_up / in_progress today)
 *      → YES → send DELAY notice to patient
 *      → NO  → promote this appointment → next_up
 */

export async function startProcessor(job) {
  try {
    const { appointmentId, doctorId, patientId } = job.data;

    console.log(`\n[startProcessor] → Running job for appointment: ${appointmentId}`);

    /* ------------------------------------------------------------------
     * (1) Fetch appointment
     * ------------------------------------------------------------------ */
    const appt = await Appointment.findById(appointmentId);

    if (!appt) {
      console.log(`[startProcessor] ❌ Appointment not found → skip`);
      return;
    }

    // Normalize stored status → lowercase
    const currentStatus = (appt.status || "").toLowerCase();

    if (currentStatus !== "accepted") {
      console.log(
        `[startProcessor] ⏭ Not eligible (status = ${currentStatus}) → skip`
      );
      return;
    }

    /* ------------------------------------------------------------------
     * (2) Check queue state for this doctor on SAME day
     * ------------------------------------------------------------------ */
    const startDay = new Date(appt.date);
    startDay.setHours(0, 0, 0, 0);

    const nextDay = new Date(startDay);
    nextDay.setDate(startDay.getDate() + 1);

    const activeAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: { $gte: startDay, $lt: nextDay },
      status: { $in: ["next_up", "in_progress"] }, // ✅ lowercase status
    });

    const doctorChannel = `user:${doctorId}`;
    const patientChannel = `user:${patientId}`;

    /* ------------------------------------------------------------------
     * (3A) CASE — Queue active → send DELAY notice
     * ------------------------------------------------------------------ */
    if (activeAppointment) {
      console.log(
        `[startProcessor] ⏳ Queue busy → Delay notice for ${appointmentId}`
      );

      const patientPayload = {
        type: "delay",
        data: {
          message:
            "The doctor is busy with another patient. Please wait, you will be notified soon.",
          appointmentid: appointmentId,
          isappointment: true,
          from: "system",
          to: "patient",
        },
      };

      await redisPub.publish(patientChannel, JSON.stringify(patientPayload));
      console.log(`[startProcessor] ✅ Delay notice sent`);
      return;
    }

    /* ------------------------------------------------------------------
     * (3B) CASE — Queue cold → Promote to NEXT_UP
     * ------------------------------------------------------------------ */
    console.log(`[startProcessor] ✅ Promoting appointment → next_up`);

    appt.status = "next_up";
    await appt.save();

    /* ------------------------------------------------------------------
     * Notify DOCTOR → FRONTEND listens to this
     * ------------------------------------------------------------------ */
    const doctorPayload = {
      type: "appointment:statusChanged",
      data: {
        appointmentID: appointmentId,
        status: "next_up",
      },
    };

    /* ------------------------------------------------------------------
     * Notify PATIENT
     * ------------------------------------------------------------------ */
    const patientPayload = {
      type: "start",
      data: {
        message:
          "You are next in line. The doctor will connect with you shortly.",
        doctorid: doctorId,
        patientid: patientId,
        appointmentid: appointmentId,
        isappointment: true,
        from: "system",
        to: "patient",
      },
    };

    await redisPub.publish(doctorChannel, JSON.stringify(doctorPayload));
    await redisPub.publish(patientChannel, JSON.stringify(patientPayload));

    console.log(`[startProcessor] ✅ NEXT_UP broadcast complete\n`);
  } catch (err) {
    console.error(`[startProcessor] ❌ ERROR:`, err);
  }
}
