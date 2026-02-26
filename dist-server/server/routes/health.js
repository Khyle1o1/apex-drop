import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
const router = Router();
router.get("/", async (_req, res) => {
    try {
        await db.execute(sql `SELECT 1`);
        res.json({ ok: true, timestamp: new Date().toISOString() });
    }
    catch (e) {
        res.status(503).json({ ok: false, error: "Database unavailable" });
    }
});
export default router;
//# sourceMappingURL=health.js.map