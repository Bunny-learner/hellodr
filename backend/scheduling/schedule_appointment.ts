import { startQueue } from "../queues/start.queue.js";


// Schedules the start job for the given appointment.

export async function scheduleJobsForAppointment(appointment:any) {
    try {
        
        console.log(`[scheduleJobsForAppointment] Scheduling appt=${appointment._id}`);
        console.log("step1")
        const timeSlot = appointment?.TimeSlot;
        if (!timeSlot || !timeSlot.StartTime || !appointment?.date) {
            console.error(
                `[scheduleJobsForAppointment] Missing timeSlot/date for appt=${appointment._id}`
            );
            return;
        }


        const [hours, minutes] = timeSlot.StartTime.split(":").map(Number);

        // appointment.date may already be Date OR string
        const appointmentTime = new Date(appointment.date);
        appointmentTime.setHours(hours, minutes, 0, 0);

        const now = new Date();
        const delayMs = appointmentTime.getTime() - now.getTime();

      //appointment is already past → skip
        console.log(delayMs)
        if (delayMs <= 0) {
            console.log(
                `[scheduleJobsForAppointment] Appt=${appointment._id} is in past → skip scheduling`
            );
            return;
        }

        const safeId = String(appointment._id).replace(/:/g, "_");

       console.log(safeId)
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

        console.log(
            `[scheduleJobsForAppointment] ✅ start job scheduled for appt=${appointment._id} — delay=${delayMs}ms (${appointmentTime.toString()})`
        );

    } catch (err) {
        console.error(`[scheduleJobsForAppointment] ERROR:`, err);
    }
}
