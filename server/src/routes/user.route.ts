import { Router } from "express";
import isAuth from "../middleware/jwt.middleware";
import user from "../controllers/user.controller";
import upload from "../middleware/upload.middleware";
import validate from "../middleware/validate.middleware";
import * as schema from "../validations/user.schema";

const router = Router();

// Public routes
router.post("/login", validate(schema.login), user.login);
router.post("/send-otp", validate(schema.sendOTP), user.resendOTP);
router.post("/register", validate(schema.register), user.register);
router.post("/verify-otp", validate(schema.verifyOTP), user.verifyOTP);

// Protected routes
router.post("/refresh", user.refresh);
router.get("/profile", isAuth, user.get);
router.post("/logout", isAuth, user.logout);
router.put(
  "/profile",
  isAuth,
  upload().single("avatar"),
  validate(schema.update),
  user.update
);

export default router;
