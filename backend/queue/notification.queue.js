import { Queue } from 'bullmq';
import redisConnection from "../db/redisconnect.js"


const notificationQueue = new Queue('appointment-notifications', {
    connection: redisConnection
});

export default notificationQueue;