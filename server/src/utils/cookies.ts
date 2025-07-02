import { Response } from "express";

const setAccessTokenCookie = (
  res: Response,
  token: string,
  maxAge: number = 15 * 60 * 1000
) => {
  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

const setRefreshTokenCookie = (
  res: Response,
  token: string,
  maxAge: number = 7 * 24 * 60 * 60 * 1000 // Default to 7 days
) => {
  res.cookie("refresh_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
};

export { setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies };
