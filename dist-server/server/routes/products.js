import { Router } from "express";
import { db, products, variants, categories } from "../db/index.js";
import { eq, and, ilike } from "drizzle-orm";
import { validateQuery, validateParams } from "../middleware/validate.js";
import { productsQuerySchema, productIdParamSchema } from "../validators/catalog.js";
const router = Router();
router.get("/", validateQuery(productsQuerySchema), async (req, res, next) => {
    try {
        const { search, categoryId } = req.query;
        const conditions = [eq(products.isActive, true)];
        if (categoryId)
            conditions.push(eq(products.categoryId, categoryId));
        if (search)
            conditions.push(ilike(products.name, `%${search}%`));
        const list = await db.select().from(products).where(and(...conditions));
        res.json(list);
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id", validateParams(productIdParamSchema), async (req, res, next) => {
    try {
        const [product] = await db
            .select()
            .from(products)
            .where(eq(products.id, req.params.id))
            .limit(1);
        if (!product) {
            res.status(404).json({ error: { message: "Product not found", code: "NOT_FOUND" } });
            return;
        }
        const [cat] = product.categoryId
            ? await db.select().from(categories).where(eq(categories.id, product.categoryId)).limit(1)
            : [null];
        res.json({ ...product, category: cat ?? null });
    }
    catch (e) {
        next(e);
    }
});
router.get("/:id/variants", validateParams(productIdParamSchema), async (req, res, next) => {
    try {
        const list = await db
            .select()
            .from(variants)
            .where(and(eq(variants.productId, req.params.id), eq(variants.isActive, true)));
        res.json(list);
    }
    catch (e) {
        next(e);
    }
});
export default router;
//# sourceMappingURL=products.js.map