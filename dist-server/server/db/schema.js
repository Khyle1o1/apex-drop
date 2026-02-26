import { pgTable, uuid, varchar, text, timestamp, boolean, decimal, jsonb, integer, uniqueIndex, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
export const userRoleEnum = ["USER", "ADMIN"];
export const orderStatusEnum = [
    "PENDING_PAYMENT",
    "PAYMENT_FOR_VERIFICATION",
    "PAID_FOR_PICKUP",
    "CLAIMED",
    "CANCELLED",
];
export const promotionTypeEnum = ["PERCENT", "FIXED"];
export const paymentMethodEnum = ["CASHIER"];
export const paymentStatusEnum = ["NONE", "SUBMITTED", "VERIFIED", "REJECTED"];
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    idNumber: varchar("id_number", { length: 64 }).notNull().unique(),
    address: text("address").notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).notNull().default("USER"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const refreshTokens = pgTable("refresh_tokens", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
});
export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: text("description"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const products = pgTable("products", {
    id: uuid("id").primaryKey().defaultRandom(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    basePrice: decimal("base_price", { precision: 12, scale: 2 }).notNull(),
    images: jsonb("images").$type().default([]),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const variants = pgTable("variants", {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
        .notNull()
        .references(() => products.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 128 }).notNull().unique(),
    variantName: varchar("variant_name", { length: 255 }),
    size: varchar("size", { length: 64 }),
    color: varchar("color", { length: 64 }),
    priceOverride: decimal("price_override", { precision: 12, scale: 2 }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const inventory = pgTable("inventory", {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
        .notNull()
        .unique()
        .references(() => variants.id, { onDelete: "cascade" }),
    stock: integer("stock").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const promotions = pgTable("promotions", {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 64 }).notNull().unique(),
    description: text("description"),
    type: varchar("type", { length: 32 }).notNull(),
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),
    startsAt: timestamp("starts_at").notNull(),
    endsAt: timestamp("ends_at").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    minSubtotal: decimal("min_subtotal", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const carts = pgTable("carts", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
        .notNull()
        .unique()
        .references(() => users.id, { onDelete: "cascade" }),
    promoCode: varchar("promo_code", { length: 64 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const cartItems = pgTable("cart_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
        .notNull()
        .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
        .notNull()
        .references(() => variants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [uniqueIndex("cart_items_cart_variant").on(t.cartId, t.variantId)]);
export const orderCounters = pgTable("order_counters", {
    year: integer("year").primaryKey(),
    seq: integer("seq").notNull().default(0),
});
export const orders = pgTable("orders", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderRef: varchar("order_ref", { length: 64 }).notNull().unique(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    status: varchar("status", { length: 64 }).notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    discountTotal: decimal("discount_total", { precision: 12, scale: 2 }).notNull().default("0"),
    total: decimal("total", { precision: 12, scale: 2 }).notNull(),
    promoCode: varchar("promo_code", { length: 64 }),
    pickupLocation: varchar("pickup_location", { length: 512 }).notNull(),
    paymentInstructions: varchar("payment_instructions", { length: 512 }).notNull(),
    notes: text("notes"),
    paidAt: timestamp("paid_at"),
    claimedAt: timestamp("claimed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const orderItems = pgTable("order_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => variants.id, { onDelete: "set null" }),
    productNameSnapshot: varchar("product_name_snapshot", { length: 255 }).notNull(),
    variantSnapshot: jsonb("variant_snapshot").$type(),
    unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    lineTotal: decimal("line_total", { precision: 12, scale: 2 }).notNull(),
});
export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
        .notNull()
        .unique()
        .references(() => orders.id, { onDelete: "cascade" }),
    method: varchar("method", { length: 32 }).notNull().default("CASHIER"),
    referenceNo: varchar("reference_no", { length: 255 }),
    proofImageUrl: varchar("proof_image_url", { length: 1024 }),
    verifiedByAdminId: uuid("verified_by_admin_id").references(() => users.id),
    verifiedAt: timestamp("verified_at"),
    status: varchar("status", { length: 32 }).notNull().default("NONE"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
export const settings = pgTable("settings", {
    id: uuid("id").primaryKey().defaultRandom(),
    storeName: varchar("store_name", { length: 255 }).notNull(),
    pickupLocation: varchar("pickup_location", { length: 512 }).notNull(),
    paymentInstructions: varchar("payment_instructions", { length: 512 }).notNull(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
    refreshTokens: many(refreshTokens),
    carts: one(carts),
    orders: many(orders),
}));
export const categoriesRelations = relations(categories, ({ many }) => ({
    products: many(products),
}));
export const productsRelations = relations(products, ({ one, many }) => ({
    category: one(categories),
    variants: many(variants),
}));
export const variantsRelations = relations(variants, ({ one, many }) => ({
    product: one(products),
    inventory: one(inventory),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
}));
export const cartsRelations = relations(carts, ({ one, many }) => ({
    user: one(users),
    items: many(cartItems),
}));
export const cartItemsRelations = relations(cartItems, ({ one }) => ({
    cart: one(carts),
    variant: one(variants),
}));
export const ordersRelations = relations(orders, ({ one, many }) => ({
    user: one(users),
    items: many(orderItems),
    payment: one(payments),
}));
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders),
    variant: one(variants),
}));
export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders),
    verifiedByAdmin: one(users),
}));
export const inventoryRelations = relations(inventory, ({ one }) => ({
    variant: one(variants),
}));
//# sourceMappingURL=schema.js.map