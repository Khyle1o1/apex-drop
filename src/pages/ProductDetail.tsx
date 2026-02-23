import { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ColorSwatches from '@/components/product/ColorSwatches';
import ProductImage from '@/components/product/ProductImage';
import ProductCard from '@/components/product/ProductCard';
import { getProductBySlug, products } from '@/lib/products';
import { useCartStore } from '@/lib/cart-store';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const product = getProductBySlug(slug || '');
  const addItem = useCartStore(s => s.addItem);

  const variantParam = searchParams.get('variant');
  const initialVariant = product?.variants.find(v => v.variantId === variantParam) || product?.variants[0];

  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.variantId || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading font-extrabold text-3xl uppercase">Product Not Found</h1>
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
    addItem(product, selectedVariant, selectedSize || undefined);
    toast.success(`${product.title} – ${selectedVariant.colorName} added to cart`);
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="rounded-card overflow-hidden aspect-square bg-muted">
            <ProductImage product={product} variant={selectedVariant} className="w-full h-full" />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.badge && (
              <span className={`self-start px-3 py-1 rounded-pill text-[11px] font-bold uppercase tracking-wider mb-4
                ${product.badge === 'New' ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground'}
              `}>
                {product.badge}
              </span>
            )}

            <h1 className="font-heading font-black text-3xl md:text-4xl uppercase tracking-tight">
              {product.title}
            </h1>

            <p className="text-2xl font-bold mt-3">${price.toFixed(2)}</p>

            <p className="text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

            {/* Color */}
            <div className="mt-8">
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
                      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all
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
              className={`mt-8 w-full py-4 rounded-lg font-heading font-bold text-sm uppercase tracking-wider transition-all
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
                <AccordionTrigger className="font-heading font-bold text-sm uppercase tracking-wide">
                  Shipping
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  Free standard shipping on orders over $75. Express shipping available at checkout. Orders ship within 1-2 business days.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="returns">
                <AccordionTrigger className="font-heading font-bold text-sm uppercase tracking-wide">
                  Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  30-day hassle-free returns on unworn items with tags attached. Free return shipping on domestic orders.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="warranty">
                <AccordionTrigger className="font-heading font-bold text-sm uppercase tracking-wide">
                  Warranty
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  All equipment comes with a 1-year limited warranty against manufacturing defects. Apparel and accessories: 90-day quality guarantee.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20 mb-10">
            <h2 className="font-heading font-extrabold text-2xl uppercase tracking-tight mb-8">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
