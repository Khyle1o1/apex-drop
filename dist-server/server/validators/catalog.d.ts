import { z } from "zod";
export declare const productsQuerySchema: z.ZodObject<{
    search: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    categoryId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search: string;
    categoryId?: string | undefined;
}, {
    search?: string | undefined;
    categoryId?: string | undefined;
}>;
export declare const productIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export type ProductsQuery = z.infer<typeof productsQuerySchema>;
export type ProductIdParam = z.infer<typeof productIdParamSchema>;
//# sourceMappingURL=catalog.d.ts.map