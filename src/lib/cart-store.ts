import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, Variant } from './products';

export interface CartItem {
  productId: string;
  variantId: string;
  size?: string;
  quantity: number;
  product: Product;
  variant: Variant;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, variant: Variant, size?: string) => void;
  removeItem: (productId: string, variantId: string, size?: string) => void;
  updateQuantity: (productId: string, variantId: string, size: string | undefined, quantity: number) => void;
  clearCart: () => void;
  getCount: () => number;
  getTotal: () => number;
}

const matchItem = (item: CartItem, productId: string, variantId: string, size?: string) =>
  item.productId === productId && item.variantId === variantId && item.size === size;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, variant, size) => {
        set((state) => {
          const existing = state.items.find(i => matchItem(i, product.id, variant.variantId, size));
          if (existing) {
            return {
              items: state.items.map(i =>
                matchItem(i, product.id, variant.variantId, size)
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { productId: product.id, variantId: variant.variantId, size, quantity: 1, product, variant }],
          };
        });
      },
      removeItem: (productId, variantId, size) => {
        set((state) => ({
          items: state.items.filter(i => !matchItem(i, productId, variantId, size)),
        }));
      },
      updateQuantity: (productId, variantId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId, size);
          return;
        }
        set((state) => ({
          items: state.items.map(i =>
            matchItem(i, productId, variantId, size) ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getTotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.variant.priceOverride ?? i.product.basePrice;
          return sum + price * i.quantity;
        }, 0),
    }),
    { name: 'apex-cart' }
  )
);
