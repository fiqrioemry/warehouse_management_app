// server/src/controllers/user.controller.ts
import { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt";
import userService from "../services/user.service";
import { Request, Response, NextFunction } from "express";
import { ResponseError } from "../middleware/error.middleware";
import { clearAuthCookies, setAccessTokenCookie } from "../utils/cookies";
import { logAudit } from "../utils/auditLog";

import dotenv from "dotenv";
dotenv.config();

async function resendOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const request = req.body.email;

    const message = await userService.sendOTP(request);

    res.status(200).json({ message });
  } catch (e) {
    next(e);
  }
}

async function verifyOTP(req: Request, res: Response, next: NextFunction) {
  try {
    const request = req.body;

    const result = await userService.verifyOTP(request, res);

    await logAudit({
      req,
      target: "User",
      action: "Register",
      targetId: result.user.id,
      userId: result.user.id,
    });

    res
      .status(200)
      .json({ message: "User registered successfully", data: result });
  } catch (e) {
    next(e);
  }
}

async function register(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.register(req.body);

    res.status(201).json({
      message: "OTP sent to email, please verify to complete registration",
    });
  } catch (e) {
    next(e);
  }
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await userService.login(req.body, res);

    await logAudit({
      req,
      userId: result.user.id,
      action: "Login",
      target: "User",
      targetId: result.user.id,
    });

    res.status(200).json({
      message: "Login successfully",
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

    setAccessTokenCookie(res, result.accessToken); // 1 hour

    res
      .status(200)
      .json({ message: "Token refreshed successfully", data: result });
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
      message: "User retrieved successfully",
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

    await logAudit({
      req,
      userId,
      action: "update profile",
      target: "User",
      targetId: result.user.id,
    });

    res.status(200).json({
      data: result,
      message: "User updated successfully",
    });
  } catch (e) {
    next(e);
  }
}

export default {
  resendOTP,
  verifyOTP,
  register,
  login,
  get,
  refresh,
  update,
  logout,
};
