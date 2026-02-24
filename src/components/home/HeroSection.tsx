import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="absolute inset-0 swoosh-hero" />

      <div className="relative container mx-auto px-4 py-20 md:py-28 lg:py-36">
        <div className="max-w-2xl mx-auto text-center md:text-left md:mx-0">
          <p className="text-accent font-heading font-bold text-sm tracking-[0.15em] mb-4">
            Official School Merchandise
          </p>
          <h1 className="font-heading font-black text-4xl md:text-5xl lg:text-6xl tracking-tight text-foreground leading-[1.05]">
            Show Your<br />Campus Pride
          </h1>
          <p className="mt-5 text-muted-foreground text-lg max-w-md leading-relaxed mx-auto md:mx-0">
            Premium merch made for students, by students. Wear your school colors with pride.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center md:justify-start">
            <Link
              to="/shop"
              className="inline-flex items-center px-7 py-3 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all"
            >
              Shop New Arrivals
            </Link>
            <Link
              to="/shop?category=Accessories"
              className="inline-flex items-center px-7 py-3 border-2 border-border text-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:border-accent hover:text-accent transition-all"
            >
              Browse Essentials
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
