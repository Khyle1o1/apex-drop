import { create } from 'zustand';
import type { CartItem } from './cart-store';

export interface SizeStock {
  id: string;
  productId: string;
  variantId: string;
  sizeLabel: string;
  quantity: number;
  isActive: boolean;
}

interface InventoryState {
  sizes: SizeStock[];
  getSizesForProductVariant: (productId: string, variantId: string) => SizeStock[];
  getAllSizesForProduct: (productId: string) => SizeStock[];
  deductForOrder: (items: CartItem[]) => { ok: boolean; message?: string };
}

export const useInventoryStore = create<InventoryState>(() => ({
  sizes: [],
  getSizesForProductVariant: () => [],
  getAllSizesForProduct: () => [],
  // Stock is now validated via backend inventory; this client-side store is a no-op.
  deductForOrder: (_items) => ({ ok: true }),
}));

