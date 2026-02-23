import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/lib/products';
import ColorSwatches from './ColorSwatches';
import ProductImage from './ProductImage';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  initialVariantId?: string;
}

export default function ProductCard({ product, initialVariantId }: ProductCardProps) {
  const [selectedId, setSelectedId] = useState(initialVariantId || product.variants[0].variantId);
  const selectedVariant = product.variants.find(v => v.variantId === selectedId) || product.variants[0];
  const price = selectedVariant.priceOverride ?? product.basePrice;
  const addItem = useCartStore(s => s.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariant.stockStatus === 'outOfStock') return;
    addItem(product, selectedVariant, product.sizes?.[0]);
    toast.success(`${product.title} – ${selectedVariant.colorName} added to cart`);
  };

  return (
    <div className="group flex flex-col">
      <Link
        to={`/product/${product.slug}?variant=${selectedId}`}
        className="block relative rounded-card overflow-hidden bg-muted aspect-[4/5]"
      >
        <ProductImage product={product} variant={selectedVariant} className="w-full h-full" />

        {/* Badge */}
        {product.badge && (
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider
              ${product.badge === 'New' ? 'bg-accent text-accent-foreground' : ''}
              ${product.badge === 'Limited' ? 'bg-destructive text-destructive-foreground' : ''}
              ${product.badge === 'Sale' ? 'bg-destructive text-destructive-foreground' : ''}
              ${product.badge === 'Free Gift' ? 'bg-destructive text-destructive-foreground' : ''}
            `}
          >
            {product.badge}
          </span>
        )}

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          disabled={selectedVariant.stockStatus === 'outOfStock'}
          className={`
            absolute bottom-3 left-3 right-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider
            transition-all translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
            ${selectedVariant.stockStatus === 'outOfStock'
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-primary text-primary-foreground hover:bg-secondary'}
          `}
        >
          {selectedVariant.stockStatus === 'outOfStock' ? 'Out of Stock' : 'Quick Add'}
        </button>
      </Link>

      <div className="pt-3 space-y-2">
        <Link to={`/product/${product.slug}?variant=${selectedId}`}>
          <h3 className="font-heading font-bold text-sm uppercase tracking-wide text-foreground hover:text-accent transition-colors">
            {product.title}
          </h3>
        </Link>
        <p className="font-semibold text-sm">${price.toFixed(2)}</p>
        <ColorSwatches
          variants={product.variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>
    </div>
  );
}
