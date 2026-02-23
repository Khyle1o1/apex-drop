import { Link } from 'react-router-dom';
import { collections } from '@/lib/products';

const bgColors: Record<string, string> = {
  new: 'from-accent/20 to-accent/5',
  competition: 'from-primary/10 to-secondary/5',
  limited: 'from-destructive/15 to-destructive/5',
};

export default function FeaturedCollections() {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="font-heading font-extrabold text-3xl md:text-4xl uppercase tracking-tight text-foreground mb-10">
        Featured Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {collections.map((col) => (
          <Link
            key={col.id}
            to={`/shop?category=${col.id === 'limited-drops' ? 'Limited+Drops' : ''}`}
            className="group relative rounded-card overflow-hidden aspect-[4/3] bg-gradient-to-br flex flex-col justify-end p-6"
            style={{
              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[col.image] || bgColors.new}`} />
            <div className="relative z-10">
              <h3 className="font-heading font-extrabold text-2xl uppercase tracking-tight text-foreground group-hover:text-accent transition-colors">
                {col.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{col.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
