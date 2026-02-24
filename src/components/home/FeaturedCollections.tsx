import { Link } from 'react-router-dom';
import { collections } from '@/lib/products';

const bgColors: Record<string, string> = {
  new: 'from-accent/15 to-accent/5',
  competition: 'from-primary/8 to-secondary/5',
  limited: 'from-destructive/10 to-destructive/5',
};

export default function FeaturedCollections() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight text-foreground mb-8">
        Featured Collections
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {collections.map((col) => (
          <Link
            key={col.id}
            to={`/shop?category=${col.id === 'limited-drops' ? 'Limited+Edition' : ''}`}
            className="group relative rounded-xl overflow-hidden aspect-[4/3] flex flex-col justify-end p-6 border border-border hover:shadow-md transition-shadow"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[col.image] || bgColors.new}`} />
            <div className="relative z-10">
              <h3 className="font-heading font-extrabold text-xl tracking-tight text-foreground group-hover:text-accent transition-colors">
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
