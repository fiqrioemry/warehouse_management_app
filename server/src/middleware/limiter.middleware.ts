import { Request, Response, NextFunction } from "express";
import { RateLimiterRedis } from "rate-limiter-flexible";
import redisClient from "../config/redis";

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "warehouse_app:middleware",
  points: 20,
  duration: 60,
});

const rateLimitMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await rateLimiter.consume(req.ip as string | number);
    next();
  } catch {
    res.status(429).json({ message: "Too Many Requests" });
  }
};

export default rateLimitMiddleware;
