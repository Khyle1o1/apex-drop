import type { Variant, Product } from '@/lib/products';

interface ProductImageProps {
  product: Product;
  variant: Variant;
  className?: string;
}

export default function ProductImage({ product, variant, className = '' }: ProductImageProps) {
  // Styled placeholder using variant color
  return (
    <div
      className={`relative overflow-hidden bg-muted flex items-center justify-center ${className}`}
      style={{
        background: `linear-gradient(135deg, ${variant.colorHex}22 0%, ${variant.colorHex}44 100%)`,
      }}
    >
      <div className="text-center p-4">
        <div
          className="w-16 h-16 rounded-lg mx-auto mb-3"
          style={{ backgroundColor: variant.colorHex, border: variant.colorHex.toLowerCase() === '#ffffff' ? '1px solid hsl(228,21%,92%)' : 'none' }}
        />
        <p className="font-heading font-bold text-sm uppercase tracking-wide text-foreground/70">
          {product.title}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{variant.colorName}</p>
      </div>
    </div>
  );
}
