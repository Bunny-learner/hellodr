import { startQueue } from "../queues/start.queue.js";
import { timeoutQueue } from "../queues/timeout.queue.js";


/**
 * removeAppointmentJobs
 *
 * Called when an appointment is cancelled or rescheduled.
 * Removes:
 *  1) startProcessor job
 *  2) timeoutProcessor job
 */
export async function removeAppointmentJobs(appointmentId) {
  try {
    const startJobId = `start-${appointmentId}`;
    const timeoutJobId = `timeout-${appointmentId}`;

    const startJob = await startQueue.getJob(startJobId);
    const timeoutJob = await timeoutQueue.getJob(timeoutJobId);

    if (startJob) {
      await startJob.remove();
      console.log(
        `[Scheduler]  Removed START job for appointment ${appointmentId}`
      );
    }

    if (timeoutJob) {
      await timeoutJob.remove();
      console.log(
        `[Scheduler] Removed TIMEOUT job for appointment ${appointmentId}`
      );
    }
  } catch (err) {
    console.error(`[Scheduler] ❌ Error removing jobs:`, err);
  }
}


