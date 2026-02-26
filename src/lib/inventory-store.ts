import { create } from 'zustand';
import type { CartItem } from './cart-store';
import { products } from './products';

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
  upsertSize: (payload: Omit<SizeStock, 'id'>) => void;
  removeSize: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  toggleActive: (id: string, isActive: boolean) => void;
  addStandardSizesForProduct: (productId: string) => void;
  getSizesForProductVariant: (productId: string, variantId: string) => SizeStock[];
  getAllSizesForProduct: (productId: string) => SizeStock[];
  deductForOrder: (items: CartItem[]) => { ok: boolean; message?: string };
}

const buildId = (productId: string, variantId: string, sizeLabel: string) =>
  `${productId}__${variantId}__${sizeLabel.toUpperCase()}`;

const seedFromProducts = (): SizeStock[] => {
  const seeded: SizeStock[] = [];
  for (const product of products) {
    if (!product.sizes || product.sizes.length === 0) continue;
    for (const variant of product.variants) {
      for (const size of product.sizes) {
        const id = buildId(product.id, variant.variantId, size);
        // Default demo seed: in stock with a small quantity
        seeded.push({
          id,
          productId: product.id,
          variantId: variant.variantId,
          sizeLabel: size,
          quantity: variant.stockStatus === 'outOfStock' ? 0 : 20,
          isActive: variant.stockStatus === 'outOfStock' ? false : true,
        });
      }
    }
  }
  return seeded;
};

export const useInventoryStore = create<InventoryState>((set, get) => {
  const initialSizes = seedFromProducts();

  return {
    sizes: initialSizes,
    upsertSize: (payload) =>
      set((state) => {
        const id = buildId(payload.productId, payload.variantId, payload.sizeLabel);
        const existingIndex = state.sizes.findIndex((s) => s.id === id);
        const next: SizeStock = { ...payload, id, quantity: Math.max(0, payload.quantity) };
        if (existingIndex === -1) {
          return { sizes: [...state.sizes, next] };
        }
        const sizes = state.sizes.slice();
        sizes[existingIndex] = next;
        return { sizes };
      }),
    removeSize: (id) =>
      set((state) => ({
        sizes: state.sizes.filter((s) => s.id !== id),
      })),
    setQuantity: (id, quantity) =>
      set((state) => ({
        sizes: state.sizes.map((s) =>
          s.id === id ? { ...s, quantity: Math.max(0, quantity) } : s,
        ),
      })),
    toggleActive: (id, isActive) =>
      set((state) => ({
        sizes: state.sizes.map((s) => (s.id === id ? { ...s, isActive } : s)),
      })),
    addStandardSizesForProduct: (productId) =>
      set((state) => {
        const standard = ['S', 'M', 'L', 'XL', '2XL'];
        const existing = state.sizes.filter((s) => s.productId === productId);
        const product = products.find((p) => p.id === productId);
        if (!product) return state;
        const additions: SizeStock[] = [];
        for (const variant of product.variants) {
          for (const size of standard) {
            const id = buildId(productId, variant.variantId, size);
            if (existing.some((s) => s.id === id)) continue;
            additions.push({
              id,
              productId,
              variantId: variant.variantId,
              sizeLabel: size,
              quantity: 0,
              isActive: true,
            });
          }
        }
        if (additions.length === 0) return state;
        return { sizes: [...state.sizes, ...additions] };
      }),
    getSizesForProductVariant: (productId, variantId) =>
      get()
        .sizes.filter((s) => s.productId === productId && s.variantId === variantId)
        .sort((a, b) => a.sizeLabel.localeCompare(b.sizeLabel, undefined, { numeric: true })),
    getAllSizesForProduct: (productId) =>
      get()
        .sizes.filter((s) => s.productId === productId)
        .sort((a, b) => a.sizeLabel.localeCompare(b.sizeLabel, undefined, { numeric: true })),
    deductForOrder: (items) => {
      // First, validate all items have sufficient stock (for size-managed items).
      const state = get();
      for (const item of items) {
        if (!item.size) continue;
        const id = buildId(item.productId, item.variantId, item.size);
        const entry = state.sizes.find((s) => s.id === id);
        if (!entry || !entry.isActive) {
          return {
            ok: false,
            message: `Size ${item.size} for ${item.product.title} is not available.`,
          };
        }
        if (entry.quantity < item.quantity) {
          return {
            ok: false,
            message: `Insufficient stock for ${item.product.title} – ${item.variant.colorName} (${item.size}).`,
          };
        }
      }

      // All good, perform deduction in a single state update.
      set((prev) => {
        const sizes = prev.sizes.map((s) => ({ ...s }));
        for (const item of items) {
          if (!item.size) continue;
          const id = buildId(item.productId, item.variantId, item.size);
          const entry = sizes.find((e) => e.id === id);
          if (!entry) continue;
          entry.quantity = Math.max(0, entry.quantity - item.quantity);
          if (entry.quantity === 0) {
            entry.isActive = false;
          }
        }
        return { sizes };
      });

      return { ok: true };
    },
  };
});

