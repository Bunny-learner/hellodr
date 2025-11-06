import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
import redisConnection from "../db/redisconnect.js"; // This is your main connection
import { redisPub } from '../db/redisconnect.js';


const worker = new Worker(
    "appointment-notifications", 
    
   
    async (job) => {
        // This code runs when the scheduled time arrives
        const { appointmentId, doctorId, patientId } = job.data;
        
        console.log(`[Worker] Processing job for appt ${appointmentId}`);

        // 4. Define the Redis Pub/Sub channels
        const doctorChannel = `user:${doctorId}`;
        const patientChannel = `user:${patientId}`;
        
        // 5. Create the notification message
        const pat_payload = JSON.stringify({
            type: 'APPOINTMENT_START',
            data: { 
                appointmentId: appointmentId,
                message: "Patient Please be ready ,Your Consultation will start within few minutes.",
                doctorid:doctorId,
                isappointment:true,
                from:"system"
            }
        });

         const doc_payload = JSON.stringify({
            type: 'APPOINTMENT_START',
            data: { 
                appointmentId: appointmentId,
                patientid:patientId,
                message: "Doctor Please be ready, your Consulation will start within few minutes.",
                isappointment:true,
                from:"system"
            }
        });


        // 6. PUBLISH the message to Redis Pub/Sub
        await redisPub.publish(doctorChannel, doc_payload);
        await redisPub.publish(patientChannel, pat_payload);
        
        console.log(`[Worker] Published to ${doctorChannel} and ${patientChannel}`);
    }, 
    
    {
        connection: redisConnection 
    }
);