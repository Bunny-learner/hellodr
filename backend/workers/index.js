import { Worker } from "bullmq";
import redisConnection  from "../db/redisconnect.js"
import {dbconnection} from "../db/dbconnect.js"
import { startProcessor } from "../processors/start.processor.js";
import { reminderProcessor } from "../processors/reminder.processor.js";
// import { timeoutProcessor } from "../processors/timeout.processor.js";
import { hydratorProcessor } from "../processors/hydrator.processor.js";



await dbconnection()
console.log("[WORKERS] Starting all BullMQ workers…");


new Worker(
  "startQueue",
  startProcessor,
  {
    connection:redisConnection,
    concurrency: 10,   
  }
);

// REMINDER
new Worker(
  "reminderQueue",
  reminderProcessor,
  {
    connection:redisConnection,
    concurrency: 10,
  }
);

// // TIMEOUT
// new Worker(
//   "timeoutQueue",
//   timeoutProcessor,
//   {
//     connection,
//     concurrency: 3,
//   }
// );

// HYDRATOR
new Worker(
  "hydrationQueue",
  hydratorProcessor,
  {
    connection:redisConnection,
    concurrency: 1, 
  }
);

console.log("[WORKERS] All workers are online ✅");

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("[WORKERS] SIGTERM received. Shutting down gracefully…");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("[WORKERS] SIGINT received. Shutting down gracefully…");
  process.exit(0);
});
