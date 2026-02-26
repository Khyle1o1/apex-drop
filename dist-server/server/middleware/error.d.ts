import type { Request, Response, NextFunction } from "express";
export declare class AppError extends Error {
    message: string;
    statusCode: number;
    code: string;
    details?: unknown | undefined;
    constructor(message: string, statusCode?: number, code?: string, details?: unknown | undefined);
}
export declare function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void;
//# sourceMappingURL=error.d.ts.map