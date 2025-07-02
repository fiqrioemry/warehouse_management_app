// server/src/middleware/key.middleware.ts
import { config } from "dotenv";
config();
import { Request, Response, NextFunction } from "express";

const apiMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers["X-API-KEY"];
  if (!apiKey || apiKey !== process.env.SERVER_API_KEY) {
    return res.status(401).json({ error: "Invalid API Key" });
  }
  next();
};

export default apiMiddleware;
