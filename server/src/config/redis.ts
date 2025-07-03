// server/src/config/redis.ts
import Redis from "ioredis";

import dotenv from "dotenv";
dotenv.config();

const { REDIS_PORT, REDIS_HOST } = process.env;

const redis = new Redis({
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
});

redis.on("connect", () => {
  console.log("Connected to Redis on port :", REDIS_PORT);
});

redis.on("error", (err: any) => {
  console.error("Redis connection error:", err);
});

export default redis;
