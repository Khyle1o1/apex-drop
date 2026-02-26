import { z } from "zod";

export const orderIdParamSchema = z.object({ id: z.string().uuid() });
export const adminOrdersQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAYMENT_FOR_VERIFICATION", "PAID_FOR_PICKUP", "CLAIMED", "CANCELLED"]),
});
export const verifyPaymentSchema = z.object({
  approve: z.boolean(),
  note: z.string().optional(),
});

export type AdminOrdersQuery = z.infer<typeof adminOrdersQuerySchema>;
export type UpdateOrderStatusBody = z.infer<typeof updateOrderStatusSchema>;
export type VerifyPaymentBody = z.infer<typeof verifyPaymentSchema>;
