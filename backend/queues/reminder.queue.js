import { Queue } from 'bullmq';
import redisConnection from "../db/redisconnect.js"


export const reminderQueue = new Queue('reminder_Queue', {
    connection: redisConnection
});

