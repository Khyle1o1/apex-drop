import { z } from "zod";
export const checkoutSchema = z.object({
    notes: z.string().optional(),
    promoCode: z.string().max(64).optional(),
});
export const orderIdParamSchema = z.object({
    id: z.string().uuid(),
});
export const submitPaymentSchema = z.object({
    referenceNo: z.string().max(255).optional(),
    proofImageUrl: z.string().max(1024).optional(),
});
//# sourceMappingURL=orders.js.map