import { apiJson } from './api';

export type StockStatus = 'inStock' | 'outOfStock';

export interface VariantSize {
  id: string;
  sizeLabel: string;
  quantity: number;
  isActive: boolean;
}

export interface Variant {
  variantId: string;
  colorName: string;
  colorHex: string;
  imageUrls: string[];
  priceOverride?: number;
  stockStatus: StockStatus;
  sizes?: VariantSize[];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  basePrice: number;
  displayPrice: number;
  hasVariantPricing: boolean;
  badge?: 'New' | 'Limited' | 'Sale' | 'Bestseller';
  sizes?: string[];
  variants: Variant[];
}

export const collections = [
  { id: 'freshman-starter', title: 'Freshman Starter Pack', description: 'Everything you need for your first semester', image: 'new' },
  { id: 'campus-essentials', title: 'Campus Essentials', description: 'Daily must-haves for school life', image: 'competition' },
  { id: 'limited-drops', title: 'Limited Edition Drops', description: 'Exclusive event merch, limited stock', image: 'limited' },
];

// ─── Helpers to map API catalog to frontend shape ──────────────────────────────

type ApiCatalogVariantSize = {
  id: string;
  size: string;
  isActive: boolean;
  stock: number;
};

type ApiCatalogVariant = {
  id: string;
  name: string;
  color: string | null;
  colorHex: string | null;
  imageUrl: string | null;
  priceOverride: string | null;
  isActive: boolean;
  stockStatus: StockStatus;
  sizes: ApiCatalogVariantSize[];
};

type ApiCatalogProduct = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  basePrice: number;
  displayPrice: number;
  hasVariantPricing: boolean;
  variants: ApiCatalogVariant[];
};

const colorHexMap: Record<string, string> = {
  navy: '#0B1026',
  maroon: '#800020',
  black: '#18181B',
  white: '#FFFFFF',
  gray: '#9CA3AF',
  'heather gray': '#9CA3AF',
  cream: '#FEF3C7',
  gold: '#F2C200',
};

function guessColorHex(name: string): string {
  const key = name.toLowerCase();
  return colorHexMap[key] ?? '#0B1026';
}

function mapApiVariant(v: ApiCatalogVariant, fallbackImage: string | null): Variant {
  const priceOverride =
    v.priceOverride != null ? Number(v.priceOverride) : undefined;
  const sizes: VariantSize[] =
    v.sizes?.map((s) => ({
      id: s.id,
      sizeLabel: s.size,
      quantity: s.stock ?? 0,
      isActive: s.isActive && (s.stock ?? 0) > 0,
    })) ?? [];

  const hex = v.colorHex ?? guessColorHex(v.color ?? v.name);
  const image = v.imageUrl ?? fallbackImage ?? null;

  return {
    variantId: v.id,
    colorName: v.color ?? v.name,
    colorHex: hex,
    imageUrls: image ? [image] : [],
    priceOverride,
    stockStatus: v.stockStatus,
    sizes,
  };
}

function mapApiProduct(p: ApiCatalogProduct): Product {
  const basePrice = Number(p.basePrice);
  const variants = p.variants.map((v) => mapApiVariant(v, p.imageUrl));
  const allSizeLabels = Array.from(
    new Set(
      variants.flatMap((v) => v.sizes?.map((s) => s.sizeLabel) ?? []),
    ),
  );

  const categoryName = p.category?.name ?? 'Uncategorized';
  const badge: Product['badge'] =
    categoryName === 'Limited Edition' ? 'Limited' : undefined;

  return {
    id: p.id,
    slug: p.id,
    title: p.name,
    description: p.description,
    category: categoryName,
    tags: [],
    basePrice,
    displayPrice: p.displayPrice ?? basePrice,
    hasVariantPricing: p.hasVariantPricing,
    badge,
    sizes: allSizeLabels,
    variants,
  };
}

// ─── Public API used by shop/frontend ──────────────────────────────────────────

export async function fetchCatalogProducts(): Promise<Product[]> {
  const apiProducts = await apiJson<ApiCatalogProduct[]>('/api/products/catalog', {
    skipAuth: true,
  });
  return apiProducts.map(mapApiProduct);
}

export async function fetchProductById(id: string): Promise<Product | undefined> {
  const list = await fetchCatalogProducts();
  return list.find((p) => p.id === id);
}
