import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import { apiLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/error.js";
import { isProd } from "./config/env.js";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import categoriesRoutes from "./routes/categories.js";
import productsRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import ordersRoutes from "./routes/orders.js";
import adminRoutes from "./routes/admin.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(helmet({ contentSecurityPolicy: isProd }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(apiLimiter);
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.get("/api", (_req, res) => {
    res.json({ message: "Campus Merch API", version: "1.0" });
});
if (isProd) {
    const distPath = path.join(__dirname, "..", "..", "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res, next) => {
        if (req.path.startsWith("/api"))
            return next();
        res.sendFile(path.join(distPath, "index.html"));
    });
}
app.use((req, res, next) => {
    if (req.path.startsWith("/api") && !res.headersSent) {
        res.status(404).json({ error: { message: "Not found", code: "NOT_FOUND" } });
        return;
    }
    next();
});
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map