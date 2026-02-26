import { z } from "zod";

export const addCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export const cartItemIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const applyPromoSchema = z.object({
  code: z.string().min(1).max(64),
});

export type AddCartItemBody = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemBody = z.infer<typeof updateCartItemSchema>;
export type CartItemIdParam = z.infer<typeof cartItemIdParamSchema>;
export type ApplyPromoBody = z.infer<typeof applyPromoSchema>;
