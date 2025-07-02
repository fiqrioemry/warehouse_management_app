// server/src/middleware/jwt.middleware.ts
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
import { Request, Response, NextFunction } from "express";

const jwtMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.access_token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    req.user = decoded;
  } catch (err) {
    return res.status(403).json({ error: "Invalid token" });
  }
};

export default jwtMiddleware;
