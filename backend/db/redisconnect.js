import { Redis } from 'ioredis';
import dotenv from "dotenv"
dotenv.config({ quiet: true })

const redisConfig =process.env.REDIS_URL

// This is for BullMQ
const redisConnection = new Redis({ ...redisConfig, maxRetriesPerRequest: null });



export const redisSub = new Redis(redisConfig);

export const redisPub = new Redis(redisConfig);


export default redisConnection; // Export default for BullMQ