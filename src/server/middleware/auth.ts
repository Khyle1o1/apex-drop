import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db, users } from "../db/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "./error.js";

export interface JwtPayload {
  sub: string;
  type: "access" | "refresh";
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  idNumber: string;
  fullName: string;
  role: string;
  isActive: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      accessToken?: string;
    }
  }
}

export function verifyAccessToken(token: string): JwtPayload {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
  if (payload.type !== "access") throw new AppError("Invalid token type", 401, "INVALID_TOKEN");
  return payload;
}

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    next(new AppError("Missing or invalid authorization", 401, "UNAUTHORIZED"));
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user || !user.isActive) {
      next(new AppError("User not found or inactive", 401, "UNAUTHORIZED"));
      return;
    }
    req.user = {
      id: user.id,
      email: user.email,
      idNumber: user.idNumber,
      fullName: user.fullName,
      role: user.role,
      isActive: user.isActive,
    };
    req.accessToken = token;
    next();
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
      return;
    }
    next(e);
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new AppError("Unauthorized", 401, "UNAUTHORIZED"));
    return;
  }
  if (req.user.role !== "ADMIN") {
    next(new AppError("Forbidden", 403, "FORBIDDEN"));
    return;
  }
  next();
}
