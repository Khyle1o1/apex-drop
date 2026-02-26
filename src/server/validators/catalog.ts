import { z } from "zod";

export const productsQuerySchema = z.object({
  search: z.string().optional().default(""),
  categoryId: z.string().uuid().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type ProductsQuery = z.infer<typeof productsQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
