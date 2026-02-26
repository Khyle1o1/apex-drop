import { AppError } from "./error.js";
export function validateBody(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        req.body = result.data;
        next();
    };
}
export function validateQuery(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        req.query = result.data;
        next();
    };
}
export function validateParams(schema) {
    return (req, _res, next) => {
        const result = schema.safeParse(req.params);
        if (!result.success) {
            next(new AppError("Validation failed", 400, "VALIDATION_ERROR", result.error.flatten()));
            return;
        }
        req.params = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map