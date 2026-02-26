import { Router } from "express";
import { and, eq, ilike, inArray } from "drizzle-orm";
import { db, categories, inventory, products, variantSizes, variants } from "../db/index.js";
import { validateParams, validateQuery } from "../middleware/validate.js";
import { productIdParamSchema, productsQuerySchema } from "../validators/catalog.js";

const router = Router();

/**
 * Basic product list used by some admin/customer views.
 * Returns flat product rows filtered by activity, category, and search.
 */
router.get("/", validateQuery(productsQuerySchema), async (req, res, next) => {
  try {
    const { search, categoryId } = req.query as { search?: string; categoryId?: string };
    const conditions = [eq(products.isActive, true)];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (search) conditions.push(ilike(products.name, `%${search}%`));

    const list = await db.select().from(products).where(and(...conditions));
    res.json(list);
  } catch (e) {
    next(e);
  }
});

/**
 * Public catalog endpoint used by the shop frontend.
 * Returns products with their active variants, sizes, and inventory stock,
 * so that the shop can reflect exactly what is configured in the admin CMS.
 */
router.get("/catalog", validateQuery(productsQuerySchema), async (req, res, next) => {
  try {
    const { search, categoryId } = req.query as { search?: string; categoryId?: string };
    const conditions = [eq(products.isActive, true)];
    if (categoryId) conditions.push(eq(products.categoryId, categoryId));
    if (search) conditions.push(ilike(products.name, `%${search}%`));

    const productRows = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        images: products.images,
        basePrice: products.basePrice,
        categoryId: products.categoryId,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions));

    if (productRows.length === 0) {
      res.json([]);
      return;
    }

    const productIds = productRows.map((p) => p.id);

    const variantRows = await db
      .select({
        id: variants.id,
        productId: variants.productId,
        variantName: variants.variantName,
        color: variants.color,
        colorHex: variants.colorHex,
        imageUrl: variants.imageUrl,
        priceOverride: variants.priceOverride,
        isActive: variants.isActive,
      })
      .from(variants)
      .where(and(inArray(variants.productId, productIds), eq(variants.isActive, true)));

    const variantIds = variantRows.map((v) => v.id);

    const sizeRows =
      variantIds.length === 0
        ? []
        : await db
            .select({
              id: variantSizes.id,
              variantId: variantSizes.variantId,
              size: variantSizes.size,
              sizeIsActive: variantSizes.isActive,
              stock: inventory.stock,
            })
            .from(variantSizes)
            .leftJoin(inventory, eq(inventory.variantSizeId, variantSizes.id))
            .where(inArray(variantSizes.variantId, variantIds));

    const catalog = productRows.map((p) => {
      const pVariants = variantRows.filter((v) => v.productId === p.id).map((v) => {
        const vSizes = sizeRows.filter((s) => s.variantId === v.id);
        const sizes = vSizes.map((s) => {
          const stock = s.stock ?? 0;
          const isActive = s.sizeIsActive && stock > 0;
          return {
            id: s.id,
            size: s.size,
            isActive,
            stock,
          };
        });
        const totalActiveStock = sizes.reduce(
          (sum, s) => (s.isActive ? sum + (s.stock ?? 0) : sum),
          0,
        );
        const stockStatus = totalActiveStock > 0 ? "inStock" : "outOfStock";
        return {
          id: v.id,
          name: v.variantName ?? v.color ?? "Default",
          color: v.color ?? v.variantName ?? "Default",
          colorHex: v.colorHex,
          imageUrl: v.imageUrl,
          priceOverride: v.priceOverride,
          isActive: v.isActive,
          stockStatus,
          sizes,
        };
      });

      const basePriceNumber = Number(p.basePrice);
      const variantPrices = pVariants
        .map((v) => (v.priceOverride != null ? Number(v.priceOverride) : basePriceNumber))
        .filter((n) => !Number.isNaN(n));
      const minPrice =
        variantPrices.length > 0 ? Math.min(...variantPrices) : basePriceNumber;

      return {
        id: p.id,
        name: p.name,
        description: p.description ?? "",
        imageUrl: (p.images && p.images[0]) || null,
        category: p.categoryId
          ? {
              id: p.categoryId,
              name: p.categoryName ?? "Uncategorized",
            }
          : null,
        basePrice: basePriceNumber,
        displayPrice: minPrice,
        hasVariantPricing:
          variantPrices.length > 0 &&
          variantPrices.some((price) => price !== basePriceNumber),
        variants: pVariants,
      };
    });

    res.json(catalog);
  } catch (e) {
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
  } catch (e) {
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
  } catch (e) {
    next(e);
  }
});

export default router;
