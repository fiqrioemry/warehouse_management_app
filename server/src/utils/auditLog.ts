import { PrismaClient } from "@prisma/client";
import { Request } from "express";

const prisma = new PrismaClient();

export const logAudit = async ({
  req,
  userId,
  action,
  target,
  targetId,
}: {
  req: Request;
  userId?: string;
  action: string;
  target?: string;
  targetId?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        targetId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
};
