import { logger } from "../utils/logger.js";
import { isProd } from "../config/env.js";
export class AppError extends Error {
    message;
    statusCode;
    code;
    details;
    constructor(message, statusCode = 500, code = "INTERNAL_ERROR", details) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = "AppError";
    }
}
export function errorHandler(err, _req, res, _next) {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
    const message = err instanceof AppError ? err.message : "Internal server error";
    const details = err instanceof AppError ? err.details : undefined;
    if (statusCode >= 500) {
        logger.error({ err, code, message }, "Server error");
    }
    else {
        logger.warn({ code, message, details }, "Client error");
    }
    res.status(statusCode).json({
        error: {
            message,
            code,
            ...(isProd ? {} : { details: details ?? (err instanceof Error ? err.stack : undefined) }),
        },
    });
}
//# sourceMappingURL=error.js.map