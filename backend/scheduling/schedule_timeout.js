import { timeoutQueue } from "../queues/timeout.queue.js";

export async function scheduleTimeoutJob(appointment) {
  try {
    const slot = appointment?.TimeSlot;
    if (!slot?.EndTime) return;

    const [h, m] = slot.EndTime.split(":").map(Number);

    const endTime = new Date(appointment.date);
    endTime.setHours(h, m, 0, 0);

    const delay = endTime.getTime() - Date.now();
    if (delay <= 0) {
      console.log(`⏩ Timeout past → skip appt=${appointment._id}`);
      return;
    }

    const jobId = `timeout-${appointment._id}`;

    await timeoutQueue.add(
      "timeout",
      {
        appointmentId: appointment._id.toString(),
        doctorId: appointment.doctor.toString(),
        patientId: appointment.patient.toString(),
      },
      {
        delay,
        jobId,              
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    console.log(`✅ Timeout scheduled appt=${appointment._id} @ ${endTime.toString()}`);
  } catch (err) {
    console.error("[scheduleTimeoutJob] ERROR:", err);
  }
}
