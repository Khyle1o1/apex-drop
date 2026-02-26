import type { Request, Response, NextFunction } from "express";
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
export declare function verifyAccessToken(token: string): JwtPayload;
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requireAdmin(req: Request, _res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map