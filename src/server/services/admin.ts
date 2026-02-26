import { sql, eq, and, gte, lte, ilike, desc, asc, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  orders,
  orderItems,
  payments,
  products,
  categories,
  variants,
  variantSizes,
  inventory,
  users,
} from "../db/schema.js";
import { AppError } from "../middleware/error.js";

const PAID_STATUSES = ["PAID_FOR_PICKUP", "CLAIMED"] as const;

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategoriesAdmin() {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
      isActive: categories.isActive,
      createdAt: categories.createdAt,
    })
    .from(categories)
    .orderBy(asc(categories.name));
  return rows;
}

export async function createCategoryAdmin(data: { name: string; description?: string }) {
  const [existing] = await db.select().from(categories).where(eq(categories.name, data.name)).limit(1);
  if (existing) throw new AppError("Category already exists", 409, "CONFLICT");
  const [cat] = await db
    .insert(categories)
    .values({ name: data.name, description: data.description ?? null })
    .returning();
  return cat!;
}

export async function deleteCategoryAdmin(categoryId: string) {
  await db.delete(categories).where(eq(categories.id, categoryId));
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function listProductsAdmin() {
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      basePrice: products.basePrice,
      images: products.images,
      isActive: products.isActive,
      categoryId: products.categoryId,
      categoryName: categories.name,
      createdAt: products.createdAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name));

  // Count variants per product
  const variantCounts = await db
    .select({
      productId: variants.productId,
      count: sql<number>`count(*)::int`,
    })
    .from(variants)
    .groupBy(variants.productId);

  const countMap = new Map(variantCounts.map((r) => [r.productId, r.count]));
  return rows.map((p) => ({ ...p, variantCount: countMap.get(p.id) ?? 0 }));
}

export async function getProductAdmin(productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      basePrice: products.basePrice,
      images: products.images,
      isActive: products.isActive,
      categoryId: products.categoryId,
      categoryName: categories.name,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, productId))
    .limit(1);

  if (!product) return null;

  const variantRows = await db
    .select({
      id: variants.id,
      variantName: variants.variantName,
      color: variants.color,
      priceOverride: variants.priceOverride,
      isActive: variants.isActive,
    })
    .from(variants)
    .where(eq(variants.productId, productId))
    .orderBy(asc(variants.variantName));

  const variantIds = variantRows.map((v) => v.id);
  const sizeRows =
    variantIds.length > 0
      ? await db
          .select({
            id: variantSizes.id,
            variantId: variantSizes.variantId,
            size: variantSizes.size,
            isActive: variantSizes.isActive,
          })
          .from(variantSizes)
          .where(inArray(variantSizes.variantId, variantIds))
          .orderBy(asc(variantSizes.size))
      : [];

  const sizesByVariant = new Map<string, typeof sizeRows>();
  for (const s of sizeRows) {
    if (!sizesByVariant.has(s.variantId)) sizesByVariant.set(s.variantId, []);
    sizesByVariant.get(s.variantId)!.push(s);
  }

  const variantsWithSizes = variantRows.map((v) => ({
    ...v,
    sizes: sizesByVariant.get(v.id) ?? [],
  }));

  return { ...product, variants: variantsWithSizes };
}

interface SizeInput {
  id?: string;
  size: string;
  isActive: boolean;
}

interface VariantInput {
  id?: string;
  name: string;
  priceOverride?: string | null;
  isActive: boolean;
  sizes: SizeInput[];
}

interface ProductInput {
  name: string;
  categoryId: string;
  basePrice: string;
  images?: string[];
  description?: string;
  isActive: boolean;
  variants: VariantInput[];
}

export async function createProductAdmin(data: ProductInput) {
  return await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({
        name: data.name,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        images: data.images ?? [],
        description: data.description ?? null,
        isActive: data.isActive,
      })
      .returning();

    for (const v of data.variants) {
      const [variant] = await tx
        .insert(variants)
        .values({
          productId: product!.id,
          variantName: v.name,
          color: v.name,
          priceOverride: v.priceOverride ?? null,
          isActive: v.isActive,
        })
        .returning();

      for (const s of v.sizes) {
        const [vs] = await tx
          .insert(variantSizes)
          .values({
            variantId: variant!.id,
            size: s.size,
            isActive: s.isActive,
          })
          .returning();

        await tx.insert(inventory).values({
          variantSizeId: vs!.id,
          stock: 0,
          reserved: 0,
        });
      }
    }

    return getProductAdmin(product!.id);
  });
}

export async function updateProductAdmin(productId: string, data: ProductInput) {
  return await db.transaction(async (tx) => {
    const [existing] = await tx.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!existing) throw new AppError("Product not found", 404, "NOT_FOUND");

    await tx
      .update(products)
      .set({
        name: data.name,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        images: data.images ?? existing.images ?? [],
        description: data.description ?? null,
        isActive: data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    // Get existing variants
    const existingVariants = await tx.select().from(variants).where(eq(variants.productId, productId));
    const incomingVariantIds = data.variants.filter((v) => v.id).map((v) => v.id!);

    // Delete variants not in the incoming list
    const toDeleteVariants = existingVariants.filter((v) => !incomingVariantIds.includes(v.id));
    for (const v of toDeleteVariants) {
      await tx.delete(variants).where(eq(variants.id, v.id));
    }

    for (const v of data.variants) {
      let variantId: string;

      if (v.id) {
        await tx
          .update(variants)
          .set({
            variantName: v.name,
            color: v.name,
            priceOverride: v.priceOverride ?? null,
            isActive: v.isActive,
            updatedAt: new Date(),
          })
          .where(eq(variants.id, v.id));
        variantId = v.id;
      } else {
        const [newVariant] = await tx
          .insert(variants)
          .values({
            productId,
            variantName: v.name,
            color: v.name,
            priceOverride: v.priceOverride ?? null,
            isActive: v.isActive,
          })
          .returning();
        variantId = newVariant!.id;
      }

      // Sync sizes
      const existingSizes = await tx
        .select()
        .from(variantSizes)
        .where(eq(variantSizes.variantId, variantId));

      const incomingSizeIds = v.sizes.filter((s) => s.id).map((s) => s.id!);
      const toDeleteSizes = existingSizes.filter((s) => !incomingSizeIds.includes(s.id));
      for (const s of toDeleteSizes) {
        await tx.delete(variantSizes).where(eq(variantSizes.id, s.id));
      }

      for (const s of v.sizes) {
        if (s.id) {
          await tx
            .update(variantSizes)
            .set({ size: s.size, isActive: s.isActive, updatedAt: new Date() })
            .where(eq(variantSizes.id, s.id));
        } else {
          const [newVs] = await tx
            .insert(variantSizes)
            .values({ variantId, size: s.size, isActive: s.isActive })
            .returning();
          await tx.insert(inventory).values({
            variantSizeId: newVs!.id,
            stock: 0,
            reserved: 0,
          });
        }
      }
    }

    return getProductAdmin(productId);
  });
}

export async function deleteProductAdmin(productId: string) {
  const [existing] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!existing) throw new AppError("Product not found", 404, "NOT_FOUND");
  // Cascade deletes variants → variantSizes → inventory
  await db.delete(products).where(eq(products.id, productId));
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function listInventoryAdmin() {
  const rows = await db
    .select({
      inventoryId: inventory.id,
      variantSizeId: inventory.variantSizeId,
      stock: inventory.stock,
      reserved: inventory.reserved,
      updatedAt: inventory.updatedAt,
      size: variantSizes.size,
      sizeIsActive: variantSizes.isActive,
      variantId: variants.id,
      variantName: variants.variantName,
      color: variants.color,
      priceOverride: variants.priceOverride,
      variantIsActive: variants.isActive,
      productId: products.id,
      productName: products.name,
      basePrice: products.basePrice,
      productIsActive: products.isActive,
      categoryName: categories.name,
    })
    .from(inventory)
    .innerJoin(variantSizes, eq(inventory.variantSizeId, variantSizes.id))
    .innerJoin(variants, eq(variantSizes.variantId, variants.id))
    .innerJoin(products, eq(variants.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(asc(products.name), asc(variants.variantName), asc(variantSizes.size));

  return rows.map((r) => ({
    ...r,
    priceApplied: r.priceOverride ?? r.basePrice,
    priceSource: r.priceOverride ? "variant" : "base",
  }));
}

export async function updateInventoryAdmin(variantSizeId: string, stock: number) {
  const [inv] = await db
    .select()
    .from(inventory)
    .where(eq(inventory.variantSizeId, variantSizeId))
    .limit(1);

  if (!inv) throw new AppError("Inventory record not found", 404, "NOT_FOUND");

  await db
    .update(inventory)
    .set({ stock, updatedAt: new Date() })
    .where(eq(inventory.variantSizeId, variantSizeId));

  return { variantSizeId, stock };
}

export async function updateVariantSizeStatusAdmin(variantSizeId: string, isActive: boolean) {
  const [vs] = await db
    .select()
    .from(variantSizes)
    .where(eq(variantSizes.id, variantSizeId))
    .limit(1);
  if (!vs) throw new AppError("Variant size not found", 404, "NOT_FOUND");
  await db
    .update(variantSizes)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(variantSizes.id, variantSizeId));
  return { variantSizeId, isActive };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard() {
  const [totalSales] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${orders.total})::numeric(12,2), 0)`,
    })
    .from(orders)
    .where(sql`${orders.status} IN ('PAID_FOR_PICKUP', 'CLAIMED')`);
  const [pendingCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(eq(orders.status, "PAYMENT_FOR_VERIFICATION"));
  const [ordersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
  return {
    totalSales: totalSales?.total ?? "0",
    pendingPaymentVerification: pendingCount?.count ?? 0,
    totalOrders: ordersCount?.count ?? 0,
  };
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function listOrdersAdmin(opts: {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) {
  const page = Math.max(1, opts.page ?? 1);
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20));
  const offset = (page - 1) * limit;
  const conditions = [];
  if (opts.status) conditions.push(eq(orders.status, opts.status));
  if (opts.dateFrom) conditions.push(gte(orders.createdAt, new Date(opts.dateFrom)));
  if (opts.dateTo) conditions.push(lte(orders.createdAt, new Date(opts.dateTo)));
  if (opts.search) conditions.push(ilike(orders.orderRef, `%${opts.search}%`));
  const where = conditions.length ? and(...conditions) : undefined;
  const list = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);
  return { list, total: countRow?.count ?? 0, page, limit };
}

export async function getOrderAdmin(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  return { ...order, items, payment: payment ?? null };
}

export async function updateOrderStatus(orderId: string, status: string) {
  const valid = ["PENDING_PAYMENT", "PAYMENT_FOR_VERIFICATION", "PAID_FOR_PICKUP", "CLAIMED", "CANCELLED"];
  if (!valid.includes(status)) throw new AppError("Invalid status", 400, "INVALID_STATUS");
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, orderId));
  const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return updated!;
}

export async function verifyPayment(
  orderId: string,
  adminId: string,
  body: { approve: boolean; note?: string }
) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  if (order.status !== "PAYMENT_FOR_VERIFICATION")
    throw new AppError("Order is not pending verification", 400, "INVALID_STATUS");
  const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
  if (!payment) throw new AppError("Payment not found", 404, "NOT_FOUND");
  const now = new Date();
  if (body.approve) {
    await db
      .update(payments)
      .set({ status: "VERIFIED", verifiedByAdminId: adminId, verifiedAt: now, updatedAt: now })
      .where(eq(payments.orderId, orderId));
    await db
      .update(orders)
      .set({ status: "PAID_FOR_PICKUP", paidAt: now, updatedAt: now })
      .where(eq(orders.id, orderId));
  } else {
    await db
      .update(payments)
      .set({ status: "REJECTED", verifiedByAdminId: adminId, verifiedAt: now, updatedAt: now })
      .where(eq(payments.orderId, orderId));
    await db
      .update(orders)
      .set({ status: "PENDING_PAYMENT", updatedAt: now })
      .where(eq(orders.id, orderId));
  }
  const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return updated!;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function getSalesSummary() {
  const result = await db
    .select({
      totalSales: sql<string>`COALESCE(SUM(${orders.total})::numeric(12,2), 0)`,
      orderCount: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(sql`${orders.status} IN ('PAID_FOR_PICKUP', 'CLAIMED')`);
  return result[0] ?? { totalSales: "0", orderCount: 0 };
}

export async function getTopProducts(limit: number = 10) {
  const result = await db
    .select({
      productName: orderItems.productNameSnapshot,
      totalQuantity: sql<number>`SUM(${orderItems.quantity})::int`,
      totalRevenue: sql<string>`SUM(${orderItems.lineTotal})::numeric(12,2)`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(sql`${orders.status} IN ('PAID_FOR_PICKUP', 'CLAIMED')`)
    .groupBy(orderItems.productNameSnapshot)
    .orderBy(desc(sql`SUM(${orderItems.quantity})`))
    .limit(limit);
  return result;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function listUsersAdmin() {
  return await db
    .select({
      id: users.id,
      fullName: users.fullName,
      idNumber: users.idNumber,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(asc(users.fullName));
}
