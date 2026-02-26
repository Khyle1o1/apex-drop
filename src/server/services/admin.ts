import { sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { orders, orderItems, payments } from "../db/schema.js";
import { eq, and, gte, lte, ilike, desc } from "drizzle-orm";
import { AppError } from "../middleware/error.js";

const PAID_STATUSES = ["PAID_FOR_PICKUP", "CLAIMED"] as const;

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
      .set({
        status: "VERIFIED",
        verifiedByAdminId: adminId,
        verifiedAt: now,
        updatedAt: now,
      })
      .where(eq(payments.orderId, orderId));
    await db
      .update(orders)
      .set({ status: "PAID_FOR_PICKUP", paidAt: now, updatedAt: now })
      .where(eq(orders.id, orderId));
  } else {
    await db
      .update(payments)
      .set({
        status: "REJECTED",
        verifiedByAdminId: adminId,
        verifiedAt: now,
        updatedAt: now,
      })
      .where(eq(payments.orderId, orderId));
    await db
      .update(orders)
      .set({ status: "PENDING_PAYMENT", updatedAt: now })
      .where(eq(orders.id, orderId));
  }
  const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return updated!;
}

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
