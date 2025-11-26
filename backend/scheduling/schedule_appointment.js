import { startQueue } from "../queues/start.queue.js";
import { reminderQueue } from "../queues/reminder.queue.js";

export async function scheduleJobsForAppointment(appointment) {
  try {
    console.log(`[scheduleJobsForAppointment] Scheduling appt=${appointment._id}`);

    const timeSlot = appointment?.TimeSlot;
    if (!timeSlot?.StartTime || !appointment?.date) {
      console.error(`Missing timeSlot/date → skipping`);
      return;
    }

    
    const [hours, minutes] = timeSlot.StartTime.split(":").map(Number);
    const appointmentTime = new Date(appointment.date);
    appointmentTime.setHours(hours, minutes, 0, 0);

    const startDelayMs = appointmentTime.getTime() - Date.now();
    console.log("startDelayMs:", startDelayMs);

    if (startDelayMs <= 0) {
      console.log(`Appt=${appointment._id} is in past → skip`);
      return;
    }

    const safeId = String(appointment._id).replace(/:/g, "_");
    
    
    await startQueue.add(
      "start",
      {
        appointmentId: safeId,
        doctorId: appointment.doctor,
        patientId: appointment.patient._id ?? appointment.patient,
      },
      {        delay: startDelayMs,
        jobId: safeId,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    console.log(`Start job scheduled in ${(startDelayMs / 60000).toFixed(1)} min`);


  } catch (err) {
    console.error("[scheduleJobsForAppointment] ERROR:", err);
  }
}
