// processors/timeout.processor.js
import { Appointment } from "../models/appointment.js";
import { Doctor } from "../models/doctor.js";
import {doctorConnections} from "../sockets/doctor.sockets.js"
import { redisPub } from "../db/redisconnect.js";

export async function timeoutProcessor(job) {
  try {
    const { appointmentId, doctorId, patientId } = job.data;

    console.log(`[timeoutProcessor] Checking appt=${appointmentId}`);

    const appt = await Appointment.findById(appointmentId);
    if (!appt) {
      console.log(`❌ Appointment not found → ${appointmentId}`);
      return;
    }

    // Appointment ended manually or cancelled
    if (appt.status !== "in-progress") {
      console.log(`⏹ Appt=${appointmentId} not active → skipping`);
      return;
    }


    const doctor = await Doctor.findById(doctorId);
 
    //already came out
    if(!doctorConnections[doctor].isRoom)
    return;
    

    // Publish "next patient waiting" message
    const doctorChannel = `user:${doctorId}`;

    const payload = JSON.stringify({
      type: "TIMEOUT_REACHED",
      data: {
        appointmentid: appointmentId,
        patientid:patientId,
        doctorid:doctorId,
        message: "Your consultation slot ended. Please check the next patient.",
        from: "system",
        to: "doctor",
      },
    });

    await redisPub.publish(doctorChannel, payload);

    console.log(`📩 Published TIMEOUT → ${doctorChannel}`);

    // Optionally mark appointment completed  
    appt.status = "completed";
    await appt.save();

    console.log(`[timeoutProcessor] ✅ Done for appt=${appointmentId}`);

  } catch (err) {
    console.error("[timeoutProcessor] Error:", err);
  }
}
