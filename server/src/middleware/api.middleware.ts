import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";

const apiMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const bypassPaths = ["/", "/health"];
  if (bypassPaths.includes(req.path)) {
    return next();
  }

  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.SERVER_API_KEY) {
    res.status(401).json({ error: "Invalid API Key" });
    return;
  }

  next();
};

export default apiMiddleware;
