import { z } from "zod";
export declare const orderIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const productIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const variantIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const adminOrdersQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    dateFrom: z.ZodOptional<z.ZodString>;
    dateTo: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    search?: string | undefined;
    status?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
}, {
    limit?: number | undefined;
    search?: string | undefined;
    status?: string | undefined;
    dateFrom?: string | undefined;
    dateTo?: string | undefined;
    page?: number | undefined;
}>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["PENDING_PAYMENT", "PAYMENT_FOR_VERIFICATION", "PAID_FOR_PICKUP", "CLAIMED", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING_PAYMENT" | "PAYMENT_FOR_VERIFICATION" | "PAID_FOR_PICKUP" | "CLAIMED" | "CANCELLED";
}, {
    status: "PENDING_PAYMENT" | "PAYMENT_FOR_VERIFICATION" | "PAID_FOR_PICKUP" | "CLAIMED" | "CANCELLED";
}>;
export declare const verifyPaymentSchema: z.ZodObject<{
    approve: z.ZodBoolean;
    note: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    approve: boolean;
    note?: string | undefined;
}, {
    approve: boolean;
    note?: string | undefined;
}>;
export declare const updateVariantInventorySchema: z.ZodObject<{
    stock: z.ZodOptional<z.ZodNumber>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    stock?: number | undefined;
}, {
    isActive?: boolean | undefined;
    stock?: number | undefined;
}>;
export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
export type UpdateVariantInventoryBody = z.infer<typeof updateVariantInventorySchema>;
//# sourceMappingURL=admin.d.ts.map