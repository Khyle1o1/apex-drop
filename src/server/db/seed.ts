import "dotenv/config";
import { db } from "./index.js";
import { eq } from "drizzle-orm";
import {
  users,
  categories,
  products,
  variants,
  variantSizes,
  inventory,
  settings,
  promotions,
} from "./schema.js";
import bcrypt from "bcrypt";
import { products as demoProducts } from "../../lib/products.js";

const SALT_ROUNDS = 10;

async function seed() {
  const passwordHash = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const userHash = await bcrypt.hash("User123!", SALT_ROUNDS);

  // Seed admin and sample user (idempotent)
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@local.dev")).limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      fullName: "Campus Store Admin",
      idNumber: "ADMIN-0001",
      address: "University Campus – Economic Enterprise Unit",
      email: "admin@local.dev",
      passwordHash,
      role: "ADMIN",
    });
  }
  const existingUser = await db.select().from(users).where(eq(users.email, "user@local.dev")).limit(1);
  if (existingUser.length === 0) {
    await db.insert(users).values({
      fullName: "Sample User",
      idNumber: "2024-001234",
      address: "123 Student Dorm",
      email: "user@local.dev",
      passwordHash: userHash,
      role: "USER",
    });
  }

  // Seed categories (idempotent by name)
  const categoryIds = new Map<string, string>();
  const categoryNames = Array.from(new Set(demoProducts.map((p) => p.category)));

  for (const name of categoryNames) {
    let [existing] = await db.select().from(categories).where(eq(categories.name, name)).limit(1);
    if (!existing) {
      [existing] = await db
        .insert(categories)
        .values({ name, description: `${name} merchandise`, isActive: true })
        .returning();
    }
    if (existing) categoryIds.set(name, existing.id);
  }

  // Reset catalog tables (inventory → variantSizes → variants → products)
  await db.delete(inventory);
  await db.delete(variantSizes);
  await db.delete(variants);
  await db.delete(products);

  for (const p of demoProducts) {
    const categoryId = categoryIds.get(p.category);
    if (!categoryId) continue;

    const images = Array.from(new Set(p.variants.flatMap((v) => v.imageUrls)));

    const [productRow] = await db
      .insert(products)
      .values({
        categoryId,
        name: p.title,
        description: p.description,
        basePrice: p.basePrice.toFixed(2),
        images: images.length ? images : ["/placeholder.svg"],
        isActive: true,
      })
      .returning({ id: products.id });

    if (!productRow) continue;

    for (const v of p.variants) {
      const [variantRow] = await db
        .insert(variants)
        .values({
          productId: productRow.id,
          sku: v.variantId,
          variantName: v.colorName,
          color: v.colorName,
          priceOverride: typeof v.priceOverride === "number" ? v.priceOverride.toFixed(2) : null,
          isActive: v.stockStatus !== "outOfStock",
        })
        .returning({ id: variants.id });

      if (!variantRow) continue;

      // Sizes are defined at the product level in the frontend demo data
      const sizesToSeed: string[] =
        p.sizes && p.sizes.length > 0
          ? p.sizes
          : ["S", "M", "L", "XL"];

      for (const size of sizesToSeed) {
        const [vsRow] = await db
          .insert(variantSizes)
          .values({
            variantId: variantRow.id,
            size,
            isActive: v.stockStatus !== "outOfStock",
          })
          .returning({ id: variantSizes.id });

        if (!vsRow) continue;

        const stock = v.stockStatus === "inStock" ? 50 : 0;
        await db.insert(inventory).values({
          variantSizeId: vsRow.id,
          stock,
          reserved: 0,
        });
      }
    }
  }

  // Promotions
  const now = new Date();
  const nextYear = new Date(now);
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  await db
    .insert(promotions)
    .values({
      code: "WELCOME10",
      description: "10% off for new users",
      type: "PERCENT",
      value: "10",
      startsAt: now,
      endsAt: nextYear,
      isActive: true,
      minSubtotal: "100.00",
    })
    .onConflictDoNothing({ target: promotions.code });

  // Settings
  await db.delete(settings);
  await db.insert(settings).values({
    storeName: "Campus Merch Store",
    pickupLocation: "University Economic Enterprise Unit",
    paymentInstructions: "Payment is done at the University Cashier",
  });

  console.log("Seed completed.");
  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});
