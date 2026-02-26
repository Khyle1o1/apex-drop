import { z } from "zod";
export const productsQuerySchema = z.object({
    search: z.string().optional().default(""),
    categoryId: z.string().uuid().optional(),
});
export const productIdParamSchema = z.object({
    id: z.string().uuid(),
});
//# sourceMappingURL=catalog.js.map