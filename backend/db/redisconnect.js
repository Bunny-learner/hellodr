import { Redis } from 'ioredis';

const redisConfig = {
  host: 'localhost',
  port: 6380
};

// This is for BullMQ
const redisConnection = new Redis({ ...redisConfig, maxRetriesPerRequest: null });



export const redisSub = new Redis(redisConfig);

export const redisPub = new Redis(redisConfig);


export default redisConnection; // Export default for BullMQ