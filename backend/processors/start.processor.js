import {Appointment} from "../models/appointment.js";
import { redisPub } from '../db/redisconnect.js';


export async function startProcessor(job) {

  
  
  try {
    const { appointmentId,doctorId,patientId } = job.data;

    console.log(`[startProcessor] Executing start job for appointment ${appointmentId}`);

    const appt = await Appointment.findById(appointmentId);

    // No appointment? Ignore
    if (!appt) {
      console.log(`[startProcessor] Appointment ${appointmentId} not found → skipping`);
      return;
    }

    // If cancelled, ignore
    if (appt.status !== "accepted") {
      console.log(`[startProcessor] Appointment ${appointmentId} not accepted (status=${appt.status}) → skipping`);
      return;
    }


   
    console.log(`[startProcessor] Running start logic for appointment ${appointmentId}`);

    // 👉 Send notifications: push/email/sms/socket
     // 4. Define the Redis Pub/Sub channels
        const doctorChannel = `user:${doctorId}`;
        const patientChannel = `user:${patientId}`;
        
       
        // Create the notification message
        const pat_payload = JSON.stringify({
             data: {
              message: "Patient Please be ready ,Your Consultation will start within few minutes.",
             doctorid:doctorId,
             patientid:patientId,
              appointmentid: appointmentId,
              isappointment: true,
              from: "system",
              to:"patient"
            }
        });

         const doc_payload = JSON.stringify({
            data: { 
                appointmentid: appointmentId,
                patientid:patientId,
                doctorid:doctorId,
                message: "Doctor Please be ready, your Consulation will start within few minutes.",
                isappointment:true,
                from:"system",
                to:"doctor"
            }
        });


        // 6. PUBLISH the message to Redis Pub/Sub
        await redisPub.publish(doctorChannel, doc_payload);
        await redisPub.publish(patientChannel, pat_payload);
        
      console.log(`[Worker] Published to ${doctorChannel} and ${patientChannel}`);
    

    console.log(`[startProcessor] ✅ Done for appointment ${appointmentId}`);

  } catch (err) {
    console.error("[startProcessor] Error:", err);
  }
}
