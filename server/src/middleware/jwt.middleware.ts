// server/src/middleware/jwt.middleware.ts
import dotenv from "dotenv";
dotenv.config();
import { verify, JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const decoded = verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    if (!decoded || typeof decoded === "string") {
      res.status(403).json({ error: "Invalid token payload" });
      return;
    }

    (req as any).user = {
      id: decoded.userId, // pastikan ini sesuai payload saat generateToken
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default authMiddleware;
