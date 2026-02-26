import type { Request, Response, NextFunction } from "express";
import type { z, ZodSchema } from "zod";
import { AppError } from "./error.js";

export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    (req as Request & { body: z.infer<T> }).body = result.data;
    next();
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    (req as Request & { query: z.infer<T> }).query = result.data;
    next();
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
      return;
    }
    (req as Request & { params: z.infer<T> }).params = result.data;
    next();
  };
}
