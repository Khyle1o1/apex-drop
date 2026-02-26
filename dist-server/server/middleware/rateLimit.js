import rateLimit from "express-rate-limit";
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: { message: "Too many requests", code: "RATE_LIMIT" } },
    standardHeaders: true,
    legacyHeaders: false,
});
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: { message: "Too many auth attempts", code: "RATE_LIMIT" } },
    standardHeaders: true,
    legacyHeaders: false,
});
//# sourceMappingURL=rateLimit.js.map