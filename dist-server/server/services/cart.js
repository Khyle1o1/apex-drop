import { db, carts, cartItems, variants, products, inventory, promotions } from "../db/index.js";
import { eq, and } from "drizzle-orm";
import { AppError } from "../middleware/error.js";
export async function getOrCreateCart(userId) {
    let [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
    if (!cart) {
        [cart] = await db.insert(carts).values({ userId }).returning();
    }
    if (!cart)
        throw new AppError("Failed to get cart", 500, "CART_ERROR");
    const items = await db
        .select({
        id: cartItems.id,
        variantId: cartItems.variantId,
        quantity: cartItems.quantity,
        unitPrice: cartItems.unitPrice,
        productName: products.name,
        variantName: variants.variantName,
        size: variants.size,
        color: variants.color,
        sku: variants.sku,
    })
        .from(cartItems)
        .innerJoin(variants, eq(cartItems.variantId, variants.id))
        .innerJoin(products, eq(variants.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));
    return { cart, items, promoCode: cart.promoCode };
}
export async function addItem(userId, body) {
    const { cart } = await getOrCreateCart(userId);
    const [variant] = await db
        .select()
        .from(variants)
        .where(and(eq(variants.id, body.variantId), eq(variants.isActive, true)))
        .limit(1);
    if (!variant)
        throw new AppError("Variant not found", 404, "NOT_FOUND");
    const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, variant.id)).limit(1);
    const available = (inv?.stock ?? 0) - (inv?.reserved ?? 0);
    const [existing] = await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.variantId, body.variantId)))
        .limit(1);
    const [prod] = await db.select({ basePrice: products.basePrice }).from(products).where(eq(products.id, variant.productId)).limit(1);
    const price = String(variant.priceOverride ?? prod?.basePrice ?? "0");
    const newQty = existing ? existing.quantity + body.quantity : body.quantity;
    if (available < newQty)
        throw new AppError("Insufficient stock", 400, "INSUFFICIENT_STOCK");
    if (existing) {
        await db
            .update(cartItems)
            .set({ quantity: newQty, updatedAt: new Date() })
            .where(eq(cartItems.id, existing.id));
    }
    else {
        await db.insert(cartItems).values({
            cartId: cart.id,
            variantId: body.variantId,
            quantity: body.quantity,
            unitPrice: price,
        });
    }
    return getOrCreateCart(userId);
}
export async function updateItem(userId, itemId, body) {
    const { cart, items } = await getOrCreateCart(userId);
    const item = items.find((i) => i.id === itemId);
    if (!item)
        throw new AppError("Cart item not found", 404, "NOT_FOUND");
    if (body.quantity === 0) {
        await db.delete(cartItems).where(eq(cartItems.id, itemId));
    }
    else {
        const [inv] = await db.select().from(inventory).where(eq(inventory.variantId, item.variantId)).limit(1);
        const available = (inv?.stock ?? 0) - (inv?.reserved ?? 0);
        if (available < body.quantity)
            throw new AppError("Insufficient stock", 400, "INSUFFICIENT_STOCK");
        await db
            .update(cartItems)
            .set({ quantity: body.quantity, updatedAt: new Date() })
            .where(eq(cartItems.id, itemId));
    }
    return getOrCreateCart(userId);
}
export async function removeItem(userId, itemId) {
    const { cart, items } = await getOrCreateCart(userId);
    const item = items.find((i) => i.id === itemId);
    if (!item)
        throw new AppError("Cart item not found", 404, "NOT_FOUND");
    await db.delete(cartItems).where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cart.id)));
    return getOrCreateCart(userId);
}
export async function applyPromo(userId, code) {
    const normalized = code.trim().toUpperCase();
    const [promo] = await db
        .select()
        .from(promotions)
        .where(and(eq(promotions.code, normalized), eq(promotions.isActive, true)))
        .limit(1);
    if (!promo)
        throw new AppError("Invalid or inactive promo code", 400, "INVALID_PROMO");
    const now = new Date();
    if (now < promo.startsAt || now > promo.endsAt)
        throw new AppError("Promo code not valid for current period", 400, "INVALID_PROMO");
    const { cart } = await getOrCreateCart(userId);
    await db.update(carts).set({ promoCode: normalized, updatedAt: new Date() }).where(eq(carts.id, cart.id));
    return getOrCreateCart(userId);
}
export async function removePromo(userId) {
    const { cart } = await getOrCreateCart(userId);
    await db.update(carts).set({ promoCode: null, updatedAt: new Date() }).where(eq(carts.id, cart.id));
    return getOrCreateCart(userId);
}
//# sourceMappingURL=cart.js.map