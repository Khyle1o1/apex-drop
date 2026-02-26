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
    if (product.sizes && product.sizes.length > 0) {
      // Require explicit size selection on the product page.
      navigate(`/product/${product.slug}?variant=${selectedId}`);
      return;
    }
    if (!isAuthenticated) {
      const from = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?reason=login_required&from=${from}`);
      return;
    }
    addItem(product, selectedVariant, undefined);
    toast.success(`${product.title} – ${selectedVariant.colorName} added to cart`);
  };

  const quickAddBaseClass =
    'w-full h-full rounded-lg text-[11px] font-bold tracking-wider transition-colors';
  const quickAddAvailabilityClass =
    selectedVariant.stockStatus === 'outOfStock'
      ? 'bg-muted text-muted-foreground cursor-not-allowed'
      : 'bg-primary text-primary-foreground hover:bg-secondary';
  const quickAddHoverClass =
    selectedVariant.stockStatus !== 'outOfStock' ? 'group-hover:bg-secondary' : '';

  let badgeClassName = 'absolute top-3 left-3 px-3 py-1 rounded-pill text-[11px] font-bold tracking-wider';
  if (product.badge === 'New') {
    badgeClassName += ' bg-accent text-accent-foreground';
  } else if (product.badge === 'Limited' || product.badge === 'Sale') {
    badgeClassName += ' bg-destructive text-destructive-foreground';
  } else if (product.badge === 'Bestseller') {
    badgeClassName += ' bg-primary text-primary-foreground';
  }

  return (
    <div className="group flex flex-col">
      <Link
        to={`/product/${product.slug}?variant=${selectedId}`}
        className="block relative rounded-2xl overflow-hidden bg-background aspect-[4/5] border border-border/60 shadow-sm transition-all cursor-pointer group-hover:shadow-lg"
      >
        <ProductImage
          product={product}
          variant={selectedVariant}
          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.04]"
        />

        {/* Badge */}
        {product.badge && (
          <span className={badgeClassName}>
            {product.badge}
          </span>
        )}
      </Link>

      <div className="pt-3 flex flex-col gap-2">
        <Link to={`/product/${product.slug}?variant=${selectedId}`}>
          <h3 className="font-heading font-bold text-sm md:text-base text-foreground hover:text-accent transition-colors leading-tight">
            {product.title}
          </h3>
        </Link>
        <p className="font-semibold text-sm md:text-[15px]">
          {formatPrice(price)}
        </p>
        <ColorSwatches
          variants={product.variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <div className="mt-2 h-9">
          <button
            onClick={handleQuickAdd}
            disabled={selectedVariant.stockStatus === 'outOfStock'}
            className={`${quickAddBaseClass} ${quickAddAvailabilityClass} ${quickAddHoverClass}`}
          >
            {selectedVariant.stockStatus === 'outOfStock' ? 'Out of Stock' : 'Quick Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
