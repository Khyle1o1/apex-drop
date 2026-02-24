import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { products } from '@/lib/products';
import ProductCard from '@/components/product/ProductCard';

export default function ProductRail() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const featured = products.filter(p => p.badge);

  return (
    <section className="py-16 swoosh-bg">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-foreground">
              Campus Picks
            </h2>
            <p className="text-muted-foreground text-sm mt-1">Student favorites this week</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex w-10 h-10 rounded-full border border-border items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex w-10 h-10 rounded-full border border-border items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <Link
              to="/shop"
              className="hidden sm:inline-flex text-sm font-semibold text-foreground hover:text-accent transition-colors ml-2"
            >
              View All →
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {featured.map((product) => (
            <div key={product.id} className="min-w-[220px] sm:min-w-[260px] max-w-[260px] snap-start flex-shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
