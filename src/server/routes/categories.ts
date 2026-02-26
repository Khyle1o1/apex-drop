import { Router } from "express";
import { db, categories } from "../db/index.js";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const list = await db.select().from(categories).where(eq(categories.isActive, true));
    res.json(list);
  } catch (e) {
    next(e);
  }
});

export default router;
