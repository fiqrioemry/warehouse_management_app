// server/src/controllers/user.controller.ts
import { config } from "dotenv";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import userService from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../middleware/error.middleware";
import { clearAuthCookies, setAccessTokenCookie } from "../utils/cookies";

config();

async function sendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const request = req.body;
    const result = await userService.sendOTP(request);
    res.status(200).json({ message: result });
  } catch (e) {
    next(e);
  }
}

async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const request = req.body;
    const result = await userService.verifyOTP(request);
    res.cookie("access_token", result.tokens.access_token);
    res.cookie("refresh_token", result.tokens.refresh_token);
    res.status(200).json({ message: "User registered successfully" });
  } catch (e) {
    next(e);
  }
}

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.register(req.body);

    res.status(201).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.login(req.body);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) throw new ResponseError(401, "Unauthenticated");

    const decoded = verifyToken(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as JwtPayload;

    const result = await userService.refresh(decoded.id, refreshToken);

    setAccessTokenCookie(res, result.access_token, 60 * 60 * 1000); // 1 hour

    res.status(200).json({ data: result });
  } catch (e) {
    next(e);
  }
}

async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.id;

    if (userId) await userService.logout(userId);

    clearAuthCookies(res);

    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    next(e);
  }
}

async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;

    const result = await userService.get(userId);

    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user.id;
    let request = req.body;
    request.id = userId;

    const result = await userService.update(request);
    res.status(200).json({
      data: result,
    });
  } catch (e) {
    next(e);
  }
}

export default {
  sendOTP,
  verifyOTP,
  register,
  login,
  get,
  refresh,
  update,
  logout,
};
