// schedule_reminder.js
import { reminderQueue } from "../queues/reminder.queue.js";
import { Patient } from "../models/patient.js";
import { Doctor } from "../models/doctor.js";

/**
 * Build the full appointment Date using the slot StartTime (HH:mm) + appointment.date (day).
 */
function buildAppointmentDate(appointment) {
  const slot = appointment?.TimeSlot;
  if (!slot?.StartTime || !appointment?.date) return null;

  const [hours, minutes] = String(slot.StartTime).split(":").map(Number);
  const dt = new Date(appointment.date);
  dt.setHours(hours, minutes, 0, 0);
  return dt;
}

/**
 * Normalize IDs regardless of populated or unpopulated refs.
 */
function getId(ref) {
  if (!ref) return null;
  if (typeof ref === "string") return ref;
  if (ref._id) return String(ref._id);
  return String(ref);
}

/**
 * Ensure we have preferences for a user (patient/doctor).
 * If the appointment already has the populated object with preferences, use it.
 * Otherwise fetch minimal doc to read preferences.
 */
async function resolvePrefs(entity, fallbackId, Model) {
  if (entity && entity.preferences) return entity.preferences;
  if (!fallbackId) return null;

  const doc = await Model.findById(fallbackId, { preferences: 1 }).lean();
  return doc?.preferences ?? null;
}

/**
 * Extract (offset, channels) from a preferences object.
 * Supports both keys: reminderoffset (preferred) and remindertime (legacy).
 */
function extractOffsetAndChannels(prefs) {
  if (!prefs) return { offset: null, channels: [] };

  const offset =
    (typeof prefs.reminderoffset !== "undefined" ? Number(prefs.reminderoffset) : null) ??
    (typeof prefs.remindertime !== "undefined" ? Number(prefs.remindertime) : null);

  const channels = Array.isArray(prefs.channels) ? prefs.channels : [];
  return { offset, channels };
}

/**
 * Schedule a single reminder job if valid.
 */
async function scheduleOneReminder({ appointment, appointmentTime, recipient, offset, channels }) {
  const apptId = getId(appointment?._id);
  const patientId = getId(appointment?.patient);
  const doctorId = getId(appointment?.doctor);

  if (!apptId || !patientId || !doctorId) {
    console.log(`[schedule_reminder] ⚠️ Missing ids (appt:${apptId}, pat:${patientId}, doc:${doctorId}) → skip ${recipient}`);
    return;
  }

  if (!offset || !channels?.length) {
    console.log(`[schedule_reminder] ⚠️ No offset/channels for ${recipient} → skip`);
    return;
  }

  const delay = appointmentTime.getTime() - offset - Date.now();
  if (delay <= 0) {
    console.log(`[schedule_reminder] ⚠️ Reminder time already passed for ${recipient} → skip`);
    return;
  }

  // Distinct jobId per recipient so they don't overwrite each other
  const safeApptId = String(apptId).replace(/:/g, "_");
  const jobId = `rem-${recipient}-${safeApptId}`;

  await reminderQueue.add(
    "reminder",
    {
      appointmentId: apptId,
      doctorId,
      patientId,
      recipient, // "patient" | "doctor" (your processor can use this to route)
    },
    {
      delay,
      jobId,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log(`[schedule_reminder] ✅ ${recipient} reminder scheduled in ${(delay / 60000).toFixed(1)} min (jobId=${jobId})`);
}


export async function scheduleRemindersForAppointment(appointment) {
  try {
    // Compute the actual appointment start Date
    const appointmentTime = buildAppointmentDate(appointment);
    if (!appointmentTime) {
      console.log("[schedule_reminder] ⚠️ Missing TimeSlot/appointment.date → skip all reminders");
      return;
    }

    // Skip if appointment start is already past
    if (appointmentTime.getTime() - Date.now() <= 0) {
      console.log("[schedule_reminder] ⚠️ Appointment already in the past → skip all reminders");
      return;
    }

    // Resolve preferences for both roles
    const patientId = getId(appointment?.patient);
    const doctorId = getId(appointment?.doctor);

    const [patPrefs, docPrefs] = await Promise.all([
      resolvePrefs(appointment?.patient, patientId, Patient),
      resolvePrefs(appointment?.doctor, doctorId, Doctor),
    ]);

    const { offset: patOffset, channels: patChannels } = extractOffsetAndChannels(patPrefs);
    const { offset: docOffset, channels: docChannels } = extractOffsetAndChannels(docPrefs);

    // Schedule per recipient (independently)
    await scheduleOneReminder({
      appointment,
      appointmentTime,
      recipient: "patient",
      offset: patOffset,
      channels: patChannels,
    });

    await scheduleOneReminder({
      appointment,
      appointmentTime,
      recipient: "doctor",
      offset: docOffset,
      channels: docChannels,
    });

    console.log(`[schedule_reminder] ✅ Finished scheduling reminders for appt=${getId(appointment?._id)}`);
  } catch (err) {
    console.error("[schedule_reminder] ❌ ERROR:", err);
  }
}
