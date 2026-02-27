-- Main product as first/default variant: product has its own color swatch; base variant for cart.
ALTER TABLE "products"
  ADD COLUMN IF NOT EXISTS "color_hex" varchar(64);

ALTER TABLE "variants"
  ADD COLUMN IF NOT EXISTS "sort_order" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "is_base" boolean NOT NULL DEFAULT false;

-- Backfill: set product.color_hex from first variant where product has no color_hex
UPDATE "products" p
SET "color_hex" = (
  SELECT v."color_hex" FROM "variants" v
  WHERE v."product_id" = p."id" AND v."is_active" = true
  ORDER BY v."variant_name" NULLS LAST
  LIMIT 1
)
WHERE p."color_hex" IS NULL;

-- Mark first variant per product as base (for existing data) so catalog can show base first
UPDATE "variants"
SET "is_base" = true
WHERE "id" IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY product_id ORDER BY variant_name NULLS LAST) AS rn
    FROM "variants"
    WHERE is_active = true
  ) t
  WHERE rn = 1
);
