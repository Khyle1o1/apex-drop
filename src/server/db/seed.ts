import "dotenv/config";
import { db } from "./index.js";
import { eq } from "drizzle-orm";
import {
  users,
  categories,
  products,
  variants,
  inventory,
  settings,
  promotions,
} from "./schema.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

async function seed() {
  const passwordHash = await bcrypt.hash("Admin123!", SALT_ROUNDS);
  const userHash = await bcrypt.hash("User123!", SALT_ROUNDS);

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

  let [cat] = await db.select().from(categories).where(eq(categories.name, "Apparel")).limit(1);
  if (!cat) {
    [cat] = await db
      .insert(categories)
      .values({
        name: "Apparel",
        description: "Campus apparel and merchandise",
        isActive: true,
      })
      .returning();
  }

  if (cat) {
    let [prod] = await db
      .select()
      .from(products)
      .where(eq(products.categoryId, cat.id))
      .limit(1);
    if (!prod) {
      [prod] = await db
        .insert(products)
        .values({
          categoryId: cat.id,
          name: "Campus T-Shirt",
          description: "Official campus t-shirt",
          basePrice: "499.00",
          images: ["/placeholder.svg"],
          isActive: true,
        })
        .returning();
    }

    if (prod) {
      const existingVariants = await db.select().from(variants).where(eq(variants.productId, prod.id)).limit(2);
      if (existingVariants.length === 0) {
        const [v1, v2] = await db
          .insert(variants)
        .values([
          {
            productId: prod.id,
            sku: "SHIRT-S-M",
            variantName: "Small",
            size: "S",
            color: "Navy",
            isActive: true,
          },
          {
            productId: prod.id,
            sku: "SHIRT-M-M",
            variantName: "Medium",
            size: "M",
            color: "Navy",
            isActive: true,
          },
        ])
        .returning({ id: variants.id });

        if (v1) await db.insert(inventory).values({ variantId: v1.id, stock: 50 });
        if (v2) await db.insert(inventory).values({ variantId: v2.id, stock: 30 });
      }
    }
  }

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
