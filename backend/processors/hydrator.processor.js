import { Appointment } from "../models/appointment.js";
import { startQueue } from "../queues/start.queue.js";

export async function hydratorProcessor(job) {
  try {
    console.log("🔄 [Hydrator] Checking appointments...");

    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + 7);   

    // Find all ACCEPTED future appointments
    const appts = await Appointment.find({
      status: "accepted",
      date: { $gte: now, $lte: future },
    }).populate("TimeSlot");

    console.log(`🔄 [Hydrator] Found ${appts.length} to process`);

    for (const appt of appts) {
      const slot = appt?.TimeSlot;
      if (!slot?.StartTime) continue;

      const [h, m] = slot.StartTime.split(":").map(Number);

      const scheduledTime = new Date(appt.date);
      scheduledTime.setHours(h, m, 0, 0);

      const delay = scheduledTime.getTime() - Date.now();

      if (delay <= 0) {
        console.log(`⏩ Skipping past appt=${appt._id}`);
        continue;
      }

      // if the jobid already exists then it ignores else it adds that job as its not there
      await startQueue.add(
        "start",
        {
          appointmentId: appt._id.toString(),
          doctorId: appt.doctor,
          patientId: appt.patient,
        },
        {
          delay,
          jobId: appt._id.toString(),
          removeOnComplete: true,
          removeOnFail: true,
        }
      );

      console.log(
        `✅ [Hydrator] Scheduled ${appt._id} @ ${scheduledTime.toString()}`
      );
    }

    console.log("✅ [Hydrator] Finished");

  } catch (err) {
    console.error("[Hydrator] ERROR:", err);
  }
}
