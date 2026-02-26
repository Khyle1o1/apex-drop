import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { db, users } from "../db/index.js";
import { eq } from "drizzle-orm";
import { AppError } from "./error.js";
export function verifyAccessToken(token) {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== "access")
        throw new AppError("Invalid token type", 401, "INVALID_TOKEN");
    return payload;
}
export async function authMiddleware(req, _res, next) {
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
    }
    catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
            return;
        }
        next(e);
    }
}
export function requireAdmin(req, _res, next) {
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
//# sourceMappingURL=auth.js.map