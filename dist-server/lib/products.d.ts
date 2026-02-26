export type StockStatus = 'inStock' | 'outOfStock';
export interface Variant {
    variantId: string;
    colorName: string;
    colorHex: string;
    imageUrls: string[];
    priceOverride?: number;
    stockStatus: StockStatus;
}
export interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: 'Apparel' | 'Accessories' | 'Stationery' | 'Bags' | 'Limited Edition';
    tags: string[];
    basePrice: number;
    badge?: 'New' | 'Limited' | 'Sale' | 'Bestseller';
    sizes?: string[];
    variants: Variant[];
}
export declare const products: Product[];
export declare const collections: {
    id: string;
    title: string;
    description: string;
    image: string;
}[];
export declare function getProductBySlug(slug: string): Product | undefined;
export declare function getProductsByCategory(category: string): Product[];
//# sourceMappingURL=products.d.ts.map