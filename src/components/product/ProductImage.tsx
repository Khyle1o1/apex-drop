import type { Variant, Product } from '@/lib/products';
import { Image as ImageIcon } from 'lucide-react';

interface ProductImageProps {
  product: Product;
  variant: Variant;
  className?: string;
}

export default function ProductImage({ product, variant, className = '' }: ProductImageProps) {
  const primaryImage = variant.imageUrls?.[0];

  return (
    <div
      className={`relative overflow-hidden bg-muted/40 flex items-center justify-center ${className}`}
    >
      {primaryImage ? (
        <img
          src={primaryImage}
          alt={`${product.title} – ${variant.colorName}`}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-background/80 border border-border">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-xs font-medium tracking-wide uppercase">
            No Image Available
          </p>
        </div>
      )}
    </div>
  );
}
