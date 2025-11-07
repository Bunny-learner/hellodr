import { Queue } from 'bullmq';
import redisConnection from "../db/redisconnect.js"


export const reminderQueue = new Queue('reminders', {
    connection: redisConnection
});

