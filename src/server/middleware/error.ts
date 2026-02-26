import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { isProd } from "../config/env.js";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const code = err instanceof AppError ? err.code : "INTERNAL_ERROR";
  const message = err instanceof AppError ? err.message : "Internal server error";
  const details = err instanceof AppError ? err.details : undefined;

  if (statusCode >= 500) {
    logger.error({ err, code, message }, "Server error");
  } else {
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
