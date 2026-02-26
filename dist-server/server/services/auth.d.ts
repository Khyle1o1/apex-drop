import type { RegisterBody, LoginBody } from "../validators/auth.js";
import type { AuthUser } from "../middleware/auth.js";
export declare function register(body: RegisterBody): Promise<{
    user: AuthUser;
}>;
export declare function login(body: LoginBody): Promise<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}>;
export declare function refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}>;
export declare function logout(refreshToken: string): Promise<void>;
//# sourceMappingURL=auth.d.ts.map