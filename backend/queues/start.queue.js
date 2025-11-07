import { Queue } from "bullmq";
import redisConnection from "../db/redisconnect.js";

export const startQueue = new Queue("startQueue", {
  connection: redisConnection,
});
