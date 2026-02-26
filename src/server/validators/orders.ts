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

export type CheckoutBody = z.infer<typeof checkoutSchema>;
export type OrderIdParam = z.infer<typeof orderIdParamSchema>;
export type SubmitPaymentBody = z.infer<typeof submitPaymentSchema>;
