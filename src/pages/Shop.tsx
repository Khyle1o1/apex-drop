import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ProductCard from '@/components/product/ProductCard';
import { products } from '@/lib/products';

const categories = ['All', 'Apparel', 'Accessories', 'Equipment', 'Limited Drops'];
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setCategory = (cat: string) => {
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const filtered = useMemo(() => {
    let result = category === 'All' ? [...products] : products.filter(p => p.category === category);
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price-desc': result.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'newest': result.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0)); break;
    }
    return result;
  }, [category, sort]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl uppercase tracking-tight">
            {category === 'All' ? 'All Products' : category}
          </h1>
          <button
            className="md:hidden flex items-center gap-2 text-sm font-semibold text-foreground border border-border rounded-lg px-4 py-2"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`
            ${filtersOpen ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto' : 'hidden'}
            md:block md:static md:w-56 flex-shrink-0
          `}>
            {filtersOpen && (
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="font-heading font-bold text-lg uppercase">Filters</h2>
                <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setFiltersOpen(false); }}
                      className={`block text-sm font-medium transition-colors ${
                        category === cat ? 'text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Sort By</h3>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                >
                  {sortOptions.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} products</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="text-center text-muted-foreground py-20">No products found in this category.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
