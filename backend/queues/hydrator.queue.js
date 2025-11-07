import { Queue } from "bullmq";
import redisConnection from "../db/redisconnect.js";

export const hydratorQueue = new Queue("hydrationQueue", {
  connection: redisConnection,
});
console.log("Hydrator loading…");



console.log("Hydrator scheduled");

async function scheduleHydrator() {
  await hydratorQueue.add(
    "hydrate",
    {},
    {
      repeat: { every: 30 * 60 * 1000 },   
      removeOnComplete: true,
      removeOnFail: true,
    }
  );

  console.log("✅ Hydrator scheduled (every 30 minutes)");
}

scheduleHydrator();
