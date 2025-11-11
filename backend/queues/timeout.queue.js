// queues/timeout.queue.js
import { Queue } from "bullmq";
import redisConnection from "../db/redisconnect.js";

export const timeoutQueue = new Queue("timeoutQueue", {
  connection: redisConnection,
});
