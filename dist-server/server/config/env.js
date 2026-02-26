import dotenv from "dotenv";
dotenv.config();
function required(key) {
    const v = process.env[key];
    if (!v)
        throw new Error(`Missing env: ${key}`);
    return v;
}
function optional(key, def) {
    return process.env[key] ?? def;
}
export const env = {
    NODE_ENV: optional("NODE_ENV", "development"),
    PORT: parseInt(optional("PORT", "4000"), 10),
    DATABASE_URL: required("DATABASE_URL"),
    JWT_ACCESS_SECRET: required("JWT_ACCESS_SECRET"),
    JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
    JWT_ACCESS_EXPIRES_IN: optional("JWT_ACCESS_EXPIRES_IN", "15m"),
    JWT_REFRESH_EXPIRES_IN: optional("JWT_REFRESH_EXPIRES_IN", "7d"),
};
export const isProd = env.NODE_ENV === "production";
//# sourceMappingURL=env.js.map