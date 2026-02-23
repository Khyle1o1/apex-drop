import { Link } from 'react-router-dom';
import heroBg from '@/assets/hero-bg.jpg';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      <div
        className="absolute inset-0 opacity-50 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-transparent" />

      <div className="relative container mx-auto px-4 py-24 md:py-36 lg:py-44">
        <div className="max-w-2xl">
          <p className="text-accent font-heading font-bold text-sm uppercase tracking-[0.2em] mb-4">
            Season 2026 Collection
          </p>
          <h1 className="font-heading font-black text-4xl md:text-6xl lg:text-7xl uppercase tracking-tight text-primary-foreground leading-[0.95]">
            Dominate<br />Every Court
          </h1>
          <p className="mt-6 text-primary-foreground/70 text-lg max-w-md leading-relaxed">
            Performance gear engineered for athletes who refuse to settle. New drops weekly.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center px-8 py-3.5 bg-accent text-accent-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:brightness-110 transition-all"
            >
              Shop New Drops
            </Link>
            <Link
              to="/shop?category=Limited+Drops"
              className="inline-flex items-center px-8 py-3.5 border-2 border-primary-foreground/30 text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:border-accent hover:text-accent transition-all"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
