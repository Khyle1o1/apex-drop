import { z } from "zod";
export declare const checkoutSchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
    promoCode: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    promoCode?: string | undefined;
    notes?: string | undefined;
}, {
    promoCode?: string | undefined;
    notes?: string | undefined;
}>;
export declare const orderIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const submitPaymentSchema: z.ZodObject<{
    referenceNo: z.ZodOptional<z.ZodString>;
    proofImageUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    referenceNo?: string | undefined;
    proofImageUrl?: string | undefined;
}, {
    referenceNo?: string | undefined;
    proofImageUrl?: string | undefined;
}>;
export type CheckoutBody = z.infer<typeof checkoutSchema>;
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;
export type SubmitPaymentBody = z.infer<typeof submitPaymentSchema>;
//# sourceMappingURL=orders.d.ts.map