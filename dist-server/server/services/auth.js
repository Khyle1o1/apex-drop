import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";
import { db, users, refreshTokens } from "../db/index.js";
import { eq, or } from "drizzle-orm";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.js";
const SALT_ROUNDS = 10;
const REFRESH_TOKEN_BYTES = 32;
function hashRefreshToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export async function register(body) {
    const email = body.email.trim().toLowerCase();
    const idNumber = body.idNumber.trim();
    const existing = await db
        .select()
        .from(users)
        .where(or(eq(users.email, email), eq(users.idNumber, idNumber)))
        .limit(2);
    if (existing.length) {
        if (existing.some((u) => u.email === email))
            throw new AppError("Email already registered", 409, "EMAIL_TAKEN");
        throw new AppError("ID Number already registered", 409, "ID_NUMBER_TAKEN");
    }
    const passwordHash = await bcrypt.hash(body.password, SALT_ROUNDS);
    const [inserted] = await db
        .insert(users)
        .values({
        fullName: body.fullName.trim(),
        idNumber,
        address: body.address.trim(),
        email,
        passwordHash,
        role: "USER",
    })
        .returning();
    if (!inserted)
        throw new AppError("Failed to create user", 500, "CREATE_FAILED");
    return {
        user: toAuthUser(inserted),
    };
}
export async function login(body) {
    const identifier = body.identifier.trim();
    const isEmail = identifier.includes("@");
    const [user] = await db
        .select()
        .from(users)
        .where(isEmail ? eq(users.email, identifier.toLowerCase()) : eq(users.idNumber, identifier))
        .limit(1);
    if (!user || !user.isActive)
        throw new AppError("Invalid identifier or password", 401, "INVALID_CREDENTIALS");
    const ok = await bcrypt.compare(body.password, user.passwordHash);
    if (!ok)
        throw new AppError("Invalid identifier or password", 401, "INVALID_CREDENTIALS");
    const accessToken = jwt.sign({ sub: user.id, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
    const rawRefresh = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);
    await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: hashRefreshToken(rawRefresh),
        expiresAt: refreshExpires,
    });
    const expiresIn = 900; // 15 min in seconds for access
    return {
        user: toAuthUser(user),
        accessToken,
        refreshToken: rawRefresh,
        expiresIn,
    };
}
export async function refresh(refreshToken) {
    const hash = hashRefreshToken(refreshToken);
    const [row] = await db
        .select()
        .from(refreshTokens)
        .where(eq(refreshTokens.tokenHash, hash))
        .limit(1);
    if (!row || new Date() > row.expiresAt) {
        throw new AppError("Invalid or expired refresh token", 401, "INVALID_REFRESH");
    }
    const [user] = await db.select().from(users).where(eq(users.id, row.userId)).limit(1);
    if (!user || !user.isActive) {
        await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
        throw new AppError("User not found or inactive", 401, "UNAUTHORIZED");
    }
    const newAccess = jwt.sign({ sub: user.id, type: "access" }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
    const newRawRefresh = randomBytes(REFRESH_TOKEN_BYTES).toString("hex");
    const refreshExpires = new Date();
    refreshExpires.setDate(refreshExpires.getDate() + 7);
    await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
    await db.insert(refreshTokens).values({
        userId: user.id,
        tokenHash: hashRefreshToken(newRawRefresh),
        expiresAt: refreshExpires,
    });
    return {
        accessToken: newAccess,
        refreshToken: newRawRefresh,
        expiresIn: 900,
    };
}
export async function logout(refreshToken) {
    const hash = hashRefreshToken(refreshToken);
    await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, hash));
}
function toAuthUser(row) {
    return {
        id: row.id,
        email: row.email,
        idNumber: row.idNumber,
        fullName: row.fullName,
        role: row.role,
        isActive: row.isActive,
    };
}
//# sourceMappingURL=auth.js.map