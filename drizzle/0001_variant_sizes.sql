-- Migration: Add variant_sizes table, update inventory and cart_items to variant-size level

-- 1. Drop dependent tables/FKs first to allow structural changes

-- Drop old inventory table (was tied to variant_id)
DROP TABLE IF EXISTS "inventory" CASCADE;

-- Drop cart_items (was tied to variant_id)
DROP TABLE IF EXISTS "cart_items" CASCADE;

-- Drop variant_id from order_items (we'll replace with variant_size_id)
ALTER TABLE "order_items" DROP COLUMN IF EXISTS "variant_id";

-- 2. Remove size column from variants (sizes now live in variant_sizes)
ALTER TABLE "variants" DROP COLUMN IF EXISTS "size";

-- 3. Make sku nullable on variants
ALTER TABLE "variants" ALTER COLUMN "sku" DROP NOT NULL;

-- 4. Create variant_sizes table
CREATE TABLE IF NOT EXISTS "variant_sizes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "variant_id" uuid NOT NULL REFERENCES "variants"("id") ON DELETE CASCADE,
  "size" varchar(64) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "variant_sizes_variant_size" ON "variant_sizes" ("variant_id", "size");

-- 5. Recreate inventory referencing variant_size_id
CREATE TABLE IF NOT EXISTS "inventory" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "variant_size_id" uuid NOT NULL UNIQUE REFERENCES "variant_sizes"("id") ON DELETE CASCADE,
  "stock" integer NOT NULL DEFAULT 0,
  "reserved" integer NOT NULL DEFAULT 0,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 6. Recreate cart_items referencing variant_size_id
CREATE TABLE IF NOT EXISTS "cart_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "cart_id" uuid NOT NULL REFERENCES "carts"("id") ON DELETE CASCADE,
  "variant_size_id" uuid NOT NULL REFERENCES "variant_sizes"("id") ON DELETE CASCADE,
  "quantity" integer NOT NULL,
  "unit_price" numeric(12,2) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "cart_items_cart_vs" ON "cart_items" ("cart_id", "variant_size_id");

-- 7. Add variant_size_id to order_items
ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "variant_size_id" uuid REFERENCES "variant_sizes"("id") ON DELETE SET NULL;
