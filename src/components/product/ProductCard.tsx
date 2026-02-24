import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { Product } from '@/lib/products';
import ColorSwatches from './ColorSwatches';
import ProductImage from './ProductImage';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';

interface ProductCardProps {
  product: Product;
  initialVariantId?: string;
}

export default function ProductCard({ product, initialVariantId }: ProductCardProps) {
  const [selectedId, setSelectedId] = useState(initialVariantId || product.variants[0].variantId);
  const selectedVariant = product.variants.find(v => v.variantId === selectedId) || product.variants[0];
  const price = selectedVariant.priceOverride ?? product.basePrice;
  const addItem = useCartStore(s => s.addItem);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariant.stockStatus === 'outOfStock') return;
    if (!isAuthenticated) {
      const from = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?reason=login_required&from=${from}`);
      return;
    }
    addItem(product, selectedVariant, product.sizes?.[0]);
    toast.success(`${product.title} – ${selectedVariant.colorName} added to cart`);
  };

  return (
    <div className="group flex flex-col">
        <Link
          to={`/product/${product.slug}?variant=${selectedId}`}
          className="block relative rounded-xl overflow-hidden bg-muted aspect-[4/5] border border-border hover:shadow-md transition-shadow"
        >
          <ProductImage product={product} variant={selectedVariant} className="w-full h-full" />

          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-3 left-3 px-3 py-1 rounded-pill text-[11px] font-bold tracking-wider
              ${product.badge === 'New' ? 'bg-accent text-accent-foreground' : ''}
              ${product.badge === 'Limited' ? 'bg-destructive text-destructive-foreground' : ''}
              ${product.badge === 'Sale' ? 'bg-destructive text-destructive-foreground' : ''}
              ${product.badge === 'Bestseller' ? 'bg-primary text-primary-foreground' : ''}
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
            absolute bottom-3 left-3 right-3 py-2.5 rounded-lg text-xs font-bold tracking-wider
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
            <h3 className="font-heading font-bold text-sm text-foreground hover:text-accent transition-colors leading-tight">
              {product.title}
            </h3>
          </Link>
          <p className="font-semibold text-sm">{formatPrice(price)}</p>
          <ColorSwatches
            variants={product.variants}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
      </div>
  );
}
