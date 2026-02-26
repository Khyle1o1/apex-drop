import { z } from "zod";

export const orderIdParamSchema = z.object({ id: z.string().uuid() });
export const productIdParamSchema = z.object({ id: z.string().uuid() });
export const variantSizeIdParamSchema = z.object({ variantSizeId: z.string().uuid() });

export const adminOrdersQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING_PAYMENT",
    "PAYMENT_FOR_VERIFICATION",
    "PAID_FOR_PICKUP",
    "CLAIMED",
    "CANCELLED",
  ]),
});

export const verifyPaymentSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});

const sizeInputSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1, "Size is required"),
  isActive: z.boolean().default(true),
});

const variantInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Variant name is required"),
  priceOverride: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => v == null || v === "" || (!isNaN(Number(v)) && Number(v) >= 0),
      "Invalid price override"
    ),
  isActive: z.boolean().default(true),
  sizes: z
    .array(sizeInputSchema)
    .min(1, "Each variant must have at least one size")
    .refine(
      (sizes) => new Set(sizes.map((s) => s.size)).size === sizes.length,
      "Duplicate sizes within the same variant"
    ),
});

export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().uuid("Category is required"),
  basePrice: z
    .string()
    .min(1, "Base price is required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Invalid price"),
  images: z.array(z.string()).optional().default([]),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z.array(variantInputSchema).min(1, "At least one variant is required"),
});

export const updateProductSchema = createProductSchema;

export const updateInventoryStockSchema = z.object({
  stock: z.number().int().min(0, "Stock cannot be negative"),
});

export const updateVariantSizeStatusSchema = z.object({
  isActive: z.boolean(),
});

export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
export type CreateProductBody = z.infer<typeof createProductSchema>;
export type UpdateInventoryStockBody = z.infer<typeof updateInventoryStockSchema>;
