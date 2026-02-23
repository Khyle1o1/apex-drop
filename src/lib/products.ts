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
  category: 'Apparel' | 'Accessories' | 'Equipment' | 'Limited Drops';
  tags: string[];
  basePrice: number;
  badge?: 'New' | 'Limited' | 'Sale' | 'Free Gift';
  sizes?: string[];
  variants: Variant[];
}

export const products: Product[] = [
  {
    id: '1',
    slug: 'apex-pro-jersey',
    title: 'Apex Pro Jersey',
    description: 'Engineered for peak performance. Moisture-wicking fabric with 4-way stretch keeps you cool and unrestricted during intense play.',
    category: 'Apparel',
    tags: ['jersey', 'performance', 'moisture-wicking'],
    basePrice: 64.99,
    badge: 'New',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    variants: [
      { variantId: 'v1-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v1-red', colorName: 'Crimson', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v1-white', colorName: 'White', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v1-gold', colorName: 'Gold Rush', colorHex: '#F2C200', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
      { variantId: 'v1-slate', colorName: 'Slate', colorHex: '#64748B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '2',
    slug: 'apex-training-shorts',
    title: 'Apex Training Shorts',
    description: 'Lightweight training shorts with built-in compression liner. Designed for explosive movement and all-day comfort.',
    category: 'Apparel',
    tags: ['shorts', 'training', 'lightweight'],
    basePrice: 44.99,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { variantId: 'v2-black', colorName: 'Black', colorHex: '#1A1A2E', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v2-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v2-gray', colorName: 'Storm Gray', colorHex: '#94A3B8', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v2-red', colorName: 'Crimson', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
    ],
  },
  {
    id: '3',
    slug: 'apex-performance-cap',
    title: 'Apex Performance Cap',
    description: 'Structured performance cap with curved brim. Sweatband interior and adjustable snapback.',
    category: 'Accessories',
    tags: ['cap', 'headwear'],
    basePrice: 29.99,
    badge: 'New',
    variants: [
      { variantId: 'v3-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v3-white', colorName: 'White', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v3-red', colorName: 'Crimson', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v3-camo', colorName: 'Urban Camo', colorHex: '#4A5568', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '4',
    slug: 'apex-elite-paddle',
    title: 'Apex Elite Paddle',
    description: 'Carbon fiber face with polymer honeycomb core. Optimized for power and control with an elongated shape.',
    category: 'Equipment',
    tags: ['paddle', 'carbon', 'elite'],
    basePrice: 189.99,
    badge: 'Limited',
    variants: [
      { variantId: 'v4-navy-gold', colorName: 'Navy Gold', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v4-red-black', colorName: 'Red Strike', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v4-white', colorName: 'Whiteout', colorHex: '#F8FAFC', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
      { variantId: 'v4-stealth', colorName: 'Stealth', colorHex: '#1E293B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v4-neon', colorName: 'Volt', colorHex: '#84CC16', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v4-sunset', colorName: 'Sunset', colorHex: '#F97316', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '5',
    slug: 'apex-grip-tape',
    title: 'Apex Grip Tape – 3 Pack',
    description: 'Premium overgrip with tacky surface for maximum control. Absorbs moisture and maintains feel.',
    category: 'Accessories',
    tags: ['grip', 'tape', 'accessories'],
    basePrice: 12.99,
    variants: [
      { variantId: 'v5-white', colorName: 'White', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v5-black', colorName: 'Black', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v5-red', colorName: 'Red', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '6',
    slug: 'apex-hoodie-heavyweight',
    title: 'Apex Heavyweight Hoodie',
    description: 'Premium 400gsm French terry hoodie. Oversized fit with kangaroo pocket and ribbed cuffs.',
    category: 'Apparel',
    tags: ['hoodie', 'heavyweight', 'casual'],
    basePrice: 89.99,
    badge: 'New',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    variants: [
      { variantId: 'v6-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v6-cream', colorName: 'Cream', colorHex: '#FEF3C7', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v6-charcoal', colorName: 'Charcoal', colorHex: '#374151', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v6-olive', colorName: 'Olive', colorHex: '#4D7C0F', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '7',
    slug: 'apex-duffle-bag',
    title: 'Apex Tournament Duffle',
    description: 'Spacious tournament bag with ventilated shoe compartment, paddle sleeve, and water-resistant base.',
    category: 'Accessories',
    tags: ['bag', 'duffle', 'tournament'],
    basePrice: 74.99,
    variants: [
      { variantId: 'v7-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v7-black', colorName: 'Black', colorHex: '#18181B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v7-camo', colorName: 'Tactical', colorHex: '#4A5568', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '8',
    slug: 'apex-pro-paddle-mid',
    title: 'Apex Pro Paddle – Midweight',
    description: 'Fiberglass face with polypropylene core. The perfect all-around paddle for intermediate players.',
    category: 'Equipment',
    tags: ['paddle', 'midweight', 'fiberglass'],
    basePrice: 129.99,
    variants: [
      { variantId: 'v8-blue', colorName: 'Arctic Blue', colorHex: '#3B82F6', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v8-red', colorName: 'Fire Red', colorHex: '#DC2626', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v8-green', colorName: 'Forest', colorHex: '#166534', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v8-pink', colorName: 'Electric Pink', colorHex: '#EC4899', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
    ],
  },
  {
    id: '9',
    slug: 'apex-compression-tee',
    title: 'Apex Compression Tee',
    description: 'Second-skin compression fit with flatlock seams. UV 50+ protection for outdoor play.',
    category: 'Apparel',
    tags: ['compression', 'tee', 'uv-protection'],
    basePrice: 39.99,
    sizes: ['S', 'M', 'L', 'XL'],
    variants: [
      { variantId: 'v9-black', colorName: 'Black', colorHex: '#0F0F0F', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v9-white', colorName: 'White', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v9-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '10',
    slug: 'apex-limited-drop-paddle',
    title: 'Apex X Limited Edition Paddle',
    description: 'Artist collaboration limited edition. Raw carbon face with custom graphic overlay. Only 500 made.',
    category: 'Limited Drops',
    tags: ['limited', 'paddle', 'collector'],
    basePrice: 249.99,
    badge: 'Limited',
    variants: [
      { variantId: 'v10-gold', colorName: 'Gold Edition', colorHex: '#F2C200', imageUrls: ['/placeholder.svg'], priceOverride: 269.99, stockStatus: 'inStock' },
      { variantId: 'v10-chrome', colorName: 'Chrome', colorHex: '#CBD5E1', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v10-obsidian', colorName: 'Obsidian', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
    ],
  },
  {
    id: '11',
    slug: 'apex-wristband-set',
    title: 'Apex Wristband Set',
    description: 'Thick terry cotton wristbands with embroidered eagle logo. Sold as a pair.',
    category: 'Accessories',
    tags: ['wristband', 'accessories'],
    basePrice: 14.99,
    badge: 'Free Gift',
    variants: [
      { variantId: 'v11-navy', colorName: 'Navy', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v11-white', colorName: 'White', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v11-red', colorName: 'Crimson', colorHex: '#B41F2B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v11-gold', colorName: 'Gold', colorHex: '#F2C200', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
    ],
  },
  {
    id: '12',
    slug: 'apex-court-shoes',
    title: 'Apex Court Dominator',
    description: 'Purpose-built court shoes with herringbone tread pattern, reinforced toe cap, and responsive cushioning.',
    category: 'Equipment',
    tags: ['shoes', 'court', 'footwear'],
    basePrice: 119.99,
    badge: 'New',
    sizes: ['8', '9', '10', '11', '12', '13'],
    variants: [
      { variantId: 'v12-navy-gold', colorName: 'Navy/Gold', colorHex: '#0B1026', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v12-white-red', colorName: 'White/Red', colorHex: '#FFFFFF', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v12-black', colorName: 'Triple Black', colorHex: '#18181B', imageUrls: ['/placeholder.svg'], stockStatus: 'inStock' },
      { variantId: 'v12-gray', colorName: 'Cool Gray', colorHex: '#9CA3AF', imageUrls: ['/placeholder.svg'], stockStatus: 'outOfStock' },
    ],
  },
];

export const collections = [
  { id: 'new-arrivals', title: 'New Arrivals', description: 'Fresh gear just dropped', image: 'new' },
  { id: 'competition-ready', title: 'Competition Ready', description: 'Tournament-tested equipment', image: 'competition' },
  { id: 'limited-drops', title: 'Limited Drops', description: 'Exclusive releases, limited stock', image: 'limited' },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}
