import { startQueue } from "../queues/start.queue.js";
import { reminderQueue } from "../queues/reminder.queue.js";


export async function scheduleJobsForAppointment(appointment) {
  try {
    console.log(`[scheduleJobsForAppointment] Scheduling appt=${appointment._id}`);
    console.log("step1");

    const timeSlot = appointment?.TimeSlot;
    if (!timeSlot?.StartTime || !appointment?.date) {
      console.error(`Missing timeSlot/date → skipping`);
      return;
    }

    const [hours, minutes] = timeSlot.StartTime.split(":").map(Number);

    const appointmentTime = new Date(appointment.date);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const delayMs = appointmentTime.getTime() - Date.now();
    console.log(delayMs);

   if (delayMs <= 0) {
  console.log(`Appt=${appointment._id} is in past → skip scheduling`);
  return;
}

const safeId = String(appointment._id).replace(/:/g, "_");
console.log("safeId:", safeId);

// ✅ Schedule START job
await startQueue.add(
  "start",
  {
    appointmentId: safeId,
    doctorId: appointment.doctor,
    patientId: appointment.patient,
  },
  {
    delay: delayMs,
    jobId: safeId,
    removeOnComplete: true,
    removeOnFail: true,
  }
);

console.log(`✅ Start job scheduled in ${(delayMs / 60000).toFixed(1)} min`);

const remindertime = appointment?.Patient?.preferences?.remindertime;
const channels    = appointment?.Patient?.preferences?.channels;


if (remindertime) {
  const reminderDate = new Date(remindertime);
  const reminderDelay = reminderDate - Date.now();

  if (reminderDelay > 0 && channels.length!=0) {
    await reminderQueue.add(
      "reminder",
      {
        appointmentId: safeId,
        doctorId: appointment.doctor,
        patientId: appointment.patient,
      },
      {
        delay: reminderDelay,
        jobId: `rem-${safeId}`,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    console.log(
      `✅ Reminder scheduled in ${(reminderDelay / 60000).toFixed(1)} min`
    );
  } else {
    console.log(`⚠️ Reminder time is past → skip`);
  }
} else {
  console.log("⚠️ No remindertime found → skip reminder scheduling");
}


    console.log(
      `[scheduleJobsForAppointment] ✅ Scheduled start for appt=${appointment._id}`
    );
  } catch (err) {
    console.error("[scheduleJobsForAppointment] ERROR:", err);
  }
}
