// server/src/service/user-service.ts
import bcrypt from "bcrypt";
import { generateToken } from "../utils/jwt";
import { PrismaClient } from "@prisma/client";
import getRandomUserAvatar from "../utils/avatar";
import { ResponseError } from "../middleware/error.middleware";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/uploader";

const prisma = new PrismaClient();
import redis from "../config/redis";
import sendEmail from "../utils/mailer";

interface RegisterRequest {
  email: string;
  password: string;
  fullname: string;
  role?: "ADMIN" | "STAFF" | "USER";
}

interface sendOTPRequest {
  email: string;
  password: string;
  fullname: string;
}

interface VerifyOTPRequest {
  email: string;
  otp: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface UpdateRequest {
  id: string;
  fullname?: string;
  avatar?: Buffer;
}

class UserService {
  // sendOTP: SendOTPRequest;
  async sendOTP(request: sendOTPRequest) {
    const { email, password, fullname } = request;

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) throw new ResponseError(400, "Email already registered");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 12);

    const tempData = JSON.stringify({ fullname, password: hashedPassword });

    await redis.setex(`otp:${email}`, 300, otp); // 5 menit

    await redis.setex(`otp_data:${email}`, 1800, tempData); // 30 menit

    await sendEmail(email, otp);

    return "OTP sent to email";
  }

  //   verifyOTP: VerifyOTPRequest;
  async verifyOTP(request: VerifyOTPRequest) {
    const { email, otp } = request;

    const savedOtp = await redis.get(`otp:${email}`);

    if (!savedOtp || savedOtp !== otp)
      throw new ResponseError(401, "Invalid or expired OTP");

    const dataStr = await redis.get(`otp_data:${email}`);
    if (!dataStr) throw new ResponseError(401, "Session expired");

    const { fullname, password } = JSON.parse(dataStr);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullname,
        password,
        avatar: getRandomUserAvatar(fullname),
        role: "USER",
      },
    });

    const payload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    };

    const accessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      "15m"
    );
    const refreshToken = generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      "7d"
    );

    await redis.setex(
      `refresh_token:${newUser.id}`,
      60 * 60 * 24 * 7,
      refreshToken
    ); // 7 hari

    await redis.del(`otp:${email}`);

    await redis.del(`otp_data:${email}`);

    return {
      user: newUser,
      tokens: { access_token: accessToken, refresh_token: refreshToken },
    };
  }

  // register: RegisterRequest;
  async register(request: RegisterRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { email: request.email },
    });

    if (existingUser) {
      throw new ResponseError(400, "Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(request.password, 12);

    // Generate avatar
    const avatarUrl = getRandomUserAvatar(request.fullname);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: request.email,
        password: hashedPassword,
        fullname: request.fullname,
        role: "USER",
        avatar: avatarUrl,
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    return {
      message: "User registered successfully",
      user,
    };
  }

  // login: LoginRequest;
  async login(request: LoginRequest) {
    const redisKey = `login:attempt:${request.email}`;

    const attempts = parseInt((await redis.get(redisKey)) || "0");
    if (attempts >= 5) {
      throw new ResponseError(
        429,
        "Too many login attempts. Please try again in 30 minutes."
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: request.email },
    });

    const isPasswordValid =
      user && (await bcrypt.compare(request.password, user.password));

    if (!user || !isPasswordValid) {
      await redis.incr(redisKey);
      await redis.expire(redisKey, 30 * 60);
      throw new ResponseError(401, "Invalid email or password");
    }

    await redis.del(redisKey);

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      "15m"
    );
    const refreshToken = generateToken(
      payload,
      process.env.REFRESH_TOKEN_SECRET!,
      "7d"
    );

    await redis.setex(
      `refresh_token:${user.id}`,
      7 * 24 * 60 * 60,
      refreshToken
    ); // 7 hari

    return {
      message: "Login successful",
      tokens: { access_token: accessToken, refresh_token: refreshToken },
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  async logout(userId: string) {
    await redis.del(`refresh_token:${userId}`);
    return { message: "Logout successful" };
  }

  // refresh token
  async refresh(userId: string, refreshToken: string) {
    const storedToken = await redis.get(`refresh_token:${userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      await redis.del(`refresh_token:${userId}`);
      throw new ResponseError(401, "Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ResponseError(404, "User not found");

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateToken(
      payload,
      process.env.ACCESS_TOKEN_SECRET!,
      "15m"
    );

    return {
      message: "Token refreshed successfully",
      access_token: newAccessToken,
    };
  }

  async get(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new ResponseError(404, "User not found");
    }

    return {
      message: "User retrieved successfully",
      user,
    };
  }

  async update(request: UpdateRequest) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: request.id },
    });

    if (!existingUser) {
      throw new ResponseError(404, "User not found");
    }

    let avatarUrl = existingUser.avatar;

    // Handle avatar upload
    if (request.avatar) {
      try {
        // Delete old avatar if it's not the default one
        if (
          existingUser.avatar &&
          !existingUser.avatar.includes("dicebear.com")
        ) {
          await deleteFromCloudinary(existingUser.avatar);
        }

        // Upload new avatar
        const uploadResult = await uploadToCloudinary(request.avatar);
        avatarUrl = uploadResult.secure_url;
      } catch (error) {
        throw new ResponseError(500, "Failed to upload avatar");
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: request.id },
      data: {
        ...(request.fullname && { fullname: request.fullname }),
        ...(avatarUrl && { avatar: avatarUrl }),
      },
      select: {
        id: true,
        email: true,
        fullname: true,
        role: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return {
      message: "User updated successfully",
      user: updatedUser,
    };
  }
}

export default new UserService();
