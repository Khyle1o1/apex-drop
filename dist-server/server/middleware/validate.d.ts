import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";
export declare function validateBody<T extends ZodSchema>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateQuery<T extends ZodSchema>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateParams<T extends ZodSchema>(schema: T): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validate.d.ts.map