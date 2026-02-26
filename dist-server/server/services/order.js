import { db } from "../db/index.js";
import { orders, orderItems, payments, carts, cartItems, inventory, variants, products, promotions, settings, } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { AppError } from "../middleware/error.js";
const PICKUP_LOCATION = "University Economic Enterprise Unit";
const PAYMENT_INSTRUCTIONS = "Payment is done at the University Cashier";
async function getSettings() {
    const [s] = await db.select().from(settings).limit(1);
    return {
        pickupLocation: s?.pickupLocation ?? PICKUP_LOCATION,
        paymentInstructions: s?.paymentInstructions ?? PAYMENT_INSTRUCTIONS,
    };
}
function formatOrderRef(year, seq) {
    return `CMERCH-${year}-${String(seq).padStart(6, "0")}`;
}
export async function checkout(userId, opts) {
    const { pickupLocation, paymentInstructions } = await getSettings();
    const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart)
        throw new AppError("Cart not found", 404, "NOT_FOUND");
    const items = await db
        .select({
        id: cartItems.id,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
    })
        .from(cartItems)
        .where(eq(cartItems.cartId, cart.id));
    if (items.length === 0)
        throw new AppError("Cart is empty", 400, "EMPTY_CART");
    const promoCode = opts.promoCode?.trim().toUpperCase() ?? cart.promoCode ?? null;
    let discountTotal = "0";
    let subtotal = 0;
    const orderLines = [];
    for (const item of items) {
        const qty = item.quantity;
        const price = parseFloat(String(item.unitPrice));
        const lineTotal = price * qty;
        subtotal += lineTotal;
        const [v] = await db.select().from(variants).where(eq(variants.id, item.variantId)).limit(1);
        const [p] = v ? await db.select().from(products).where(eq(products.id, v.productId)).limit(1) : [null];
        orderLines.push({
            variantId: item.variantId,
            productName: p?.name ?? "Unknown",
            variantSnapshot: v ? { sku: v.sku, variantName: v.variantName, size: v.size, color: v.color } : {},
            unitPrice: String(item.unitPrice),
            quantity: qty,
            lineTotal,
        });
    }
    if (promoCode) {
        const [promo] = await db
            .select()
            .from(promotions)
            .where(and(eq(promotions.code, promoCode), eq(promotions.isActive, true)))
            .limit(1);
        if (promo) {
            const minSub = promo.minSubtotal ? parseFloat(String(promo.minSubtotal)) : 0;
            if (subtotal >= minSub) {
                const val = parseFloat(String(promo.value));
                if (promo.type === "PERCENT")
                    discountTotal = String((subtotal * val) / 100);
                else
                    discountTotal = String(Math.min(val, subtotal));
            }
        }
    }
    const total = Math.max(0, subtotal - parseFloat(discountTotal));
    return await db.transaction(async (tx) => {
        const year = new Date().getFullYear();
        const seqResult = await tx.execute(sql `
      INSERT INTO order_counters (year, seq) VALUES (${year}, 1)
      ON CONFLICT (year) DO UPDATE SET seq = order_counters.seq + 1
      RETURNING seq
    `);
        const seq = seqResult.rows[0]?.seq ?? 1;
        const orderRef = formatOrderRef(year, seq);
        for (const item of items) {
            const [inv] = await tx.select().from(inventory).where(eq(inventory.variantId, item.variantId)).limit(1);
            if (!inv)
                throw new AppError("Variant inventory not found", 400, "INVENTORY_ERROR");
            const available = inv.stock - inv.reserved;
            if (available < item.quantity) {
                throw new AppError(`Insufficient stock for variant ${item.variantId}`, 400, "INSUFFICIENT_STOCK");
            }
            await tx
                .update(inventory)
                .set({ stock: inv.stock - item.quantity, updatedAt: new Date() })
                .where(eq(inventory.variantId, item.variantId));
        }
        const [order] = await tx
            .insert(orders)
            .values({
            orderRef,
            userId,
            status: "PENDING_PAYMENT",
            subtotal: String(subtotal),
            discountTotal,
            total: String(total),
            promoCode,
            pickupLocation,
            paymentInstructions,
            notes: opts.notes ?? null,
        })
            .returning();
        if (!order)
            throw new AppError("Failed to create order", 500, "ORDER_ERROR");
        for (const line of orderLines) {
            await tx.insert(orderItems).values({
                orderId: order.id,
                variantId: line.variantId,
                productNameSnapshot: line.productName,
                variantSnapshot: line.variantSnapshot,
                unitPrice: line.unitPrice,
                quantity: line.quantity,
                lineTotal: String(line.lineTotal),
            });
        }
        await tx.insert(payments).values({
            orderId: order.id,
            method: "CASHIER",
            status: "NONE",
        });
        await tx.delete(cartItems).where(eq(cartItems.cartId, cart.id));
        await tx.update(carts).set({ promoCode: null, updatedAt: new Date() }).where(eq(carts.id, cart.id));
        const [created] = await tx
            .select()
            .from(orders)
            .where(eq(orders.id, order.id))
            .limit(1);
        return created;
    });
}
export async function listOrders(userId) {
    const list = await db.select().from(orders).where(eq(orders.userId, userId));
    return list;
}
export async function getOrder(userId, orderId) {
    const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .limit(1);
    if (!order)
        return null;
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
    return { ...order, items };
}
export async function submitPayment(userId, orderId, body) {
    const [order] = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .limit(1);
    if (!order)
        throw new AppError("Order not found", 404, "NOT_FOUND");
    if (order.status !== "PENDING_PAYMENT")
        throw new AppError("Order is not pending payment", 400, "INVALID_STATUS");
    const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1);
    if (!payment)
        throw new AppError("Payment record not found", 500, "PAYMENT_ERROR");
    await db
        .update(payments)
        .set({
        referenceNo: body.referenceNo ?? null,
        proofImageUrl: body.proofImageUrl ?? null,
        status: "SUBMITTED",
        updatedAt: new Date(),
    })
        .where(eq(payments.orderId, orderId));
    await db
        .update(orders)
        .set({ status: "PAYMENT_FOR_VERIFICATION", updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    const [updated] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return updated;
}
//# sourceMappingURL=order.js.map