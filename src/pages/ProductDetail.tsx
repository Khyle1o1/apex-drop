import { useState } from 'react';
import { useParams, useSearchParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ColorSwatches from '@/components/product/ColorSwatches';
import ProductImage from '@/components/product/ProductImage';
import ProductCard from '@/components/product/ProductCard';
import { getProductBySlug, products } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuthStore } from '@/lib/auth-store';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const product = getProductBySlug(slug || '');
  const addItem = useCartStore(s => s.addItem);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const navigate = useNavigate();
  const location = useLocation();

  const variantParam = searchParams.get('variant');
  const initialVariant = product?.variants.find(v => v.variantId === variantParam) || product?.variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.variantId || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading font-extrabold text-3xl">Product Not Found</h1>
          <Link to="/shop" className="text-accent mt-4 inline-block">← Back to Shop</Link>
        </div>
      </Layout>
    );
  }

  const selectedVariant = product.variants.find(v => v.variantId === selectedVariantId) || product.variants[0];
  const price = selectedVariant.priceOverride ?? product.basePrice;
  const outOfStock = selectedVariant.stockStatus === 'outOfStock';

  const handleVariantChange = (id: string) => {
    setSelectedVariantId(id);
    searchParams.set('variant', id);
    setSearchParams(searchParams, { replace: true });
  };

  const handleAddToCart = () => {
    if (outOfStock) return;
    if (!isAuthenticated) {
      const from = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?reason=login_required&from=${from}`);
      return;
    }
    addItem(product, selectedVariant, selectedSize || undefined);
    toast.success(`${product.title} – ${selectedVariant.colorName} added to cart`);
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 md:mb-8 overflow-x-auto">
          <Link to="/" className="hover:text-accent transition-colors whitespace-nowrap">Home</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <Link to="/shop" className="hover:text-accent transition-colors whitespace-nowrap">Shop</Link>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-foreground truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="rounded-xl overflow-hidden aspect-square bg-muted border border-border">
            <ProductImage product={product} variant={selectedVariant} className="w-full h-full" />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.badge && (
              <span className={`self-start px-3 py-1 rounded-pill text-[11px] font-bold tracking-wider mb-3
                ${product.badge === 'New' ? 'bg-accent text-accent-foreground' : ''}
                ${product.badge === 'Bestseller' ? 'bg-primary text-primary-foreground' : ''}
                ${product.badge === 'Limited' || product.badge === 'Sale' ? 'bg-destructive text-destructive-foreground' : ''}
              `}>
                {product.badge}
              </span>
            )}

            <h1 className="font-heading font-black text-2xl md:text-3xl lg:text-4xl tracking-tight">
              {product.title}
            </h1>

            <p className="text-2xl font-bold mt-3">{formatPrice(price)}</p>

            <p className="text-muted-foreground mt-4 leading-relaxed text-sm md:text-base">{product.description}</p>

            {/* Perfect for chips */}
            {product.tags.length > 0 && (
              <div className="mt-4 flex gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-medium">Perfect for:</span>
                {product.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-muted text-muted-foreground text-xs rounded-pill font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Color */}
            <div className="mt-6">
              <p className="text-sm font-semibold mb-3">
                Color: <span className="font-normal text-muted-foreground">{selectedVariant.colorName}</span>
              </p>
              <ColorSwatches
                variants={product.variants}
                selectedId={selectedVariantId}
                onSelect={handleVariantChange}
                size="md"
              />
            </div>

            {/* Size */}
            {product.sizes && (
              <div className="mt-6">
                <p className="text-sm font-semibold mb-3">Size</p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all min-w-[44px] min-h-[44px]
                        ${selectedSize === s
                          ? 'border-accent bg-accent/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-foreground'}
                      `}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className={`mt-8 w-full py-4 rounded-lg font-heading font-bold text-sm tracking-wider transition-all min-h-[48px]
                ${outOfStock
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-primary text-primary-foreground hover:bg-secondary'}
              `}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {/* Accordions */}
            <Accordion type="multiple" className="mt-8 border-t border-border">
              <AccordionItem value="shipping">
                <AccordionTrigger className="font-heading font-bold text-sm">
                  Pickup & Payment
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Pickup Only — University Economic Enterprise Unit. Payment is done at the University Cashier.
                  Bring the official cashier receipt to claim your merch.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="font-heading font-bold text-sm">
                  Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  7-day return policy on unworn items with original tags. Contact us at store@campus.edu.ph for return requests.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="font-heading font-bold text-sm">
                  Care Instructions
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Machine wash cold, tumble dry low. Do not bleach. Iron on low heat if needed. See product label for specific care details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16 mb-10">
            <h2 className="font-heading font-extrabold text-xl md:text-2xl tracking-tight mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
