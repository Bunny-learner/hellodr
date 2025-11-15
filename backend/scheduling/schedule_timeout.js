import { timeoutQueue } from "../queues/timeout.queue.js";

const TIMEOUT_GRACE_PERIOD_MS = 1 * 60 * 1000;

export async function scheduleTimeoutJobs(appointment) {
  try {
    console.log("[Scheduler] scheduling for", appointment._id);

    const jobData = {
      doctorId: appointment.doctor.toString(),
      patientId: appointment.patient.toString(),
      appointmentId: appointment._id.toString(),
    };

    
    const [hours, minutes] = appointment.TimeSlot.StartTime.split(":").map(Number);

    const startDate = new Date(appointment.date);
    startDate.setHours(hours, minutes, 0, 0);

    const startTime = startDate.getTime();
    const timeoutTime = startTime + TIMEOUT_GRACE_PERIOD_MS;

    const now = Date.now();
    const timeoutDelay = timeoutTime - now;

    if (timeoutDelay > 0) {
      const timeoutJobId = `timeout-${appointment._id}`;

      await timeoutQueue.add("process-timeout", jobData, {
        delay: timeoutDelay,
        jobId: timeoutJobId,
        removeOnComplete: true,
        removeOnFail: true,
        replaceExisting: true, 
      });

      console.log(
        `[Scheduler] TIMEOUT job scheduled for ${appointment._id} at ${new Date(timeoutTime)}`
      );
    } else {
      console.log(
        `[Scheduler] Timeout passed for ${appointment._id}, skipping.`
      );
    }
  } catch (err) {
    console.error(`[Scheduler] Error scheduling timeout job:`, err);
  }
}
