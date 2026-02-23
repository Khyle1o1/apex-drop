import { useState } from 'react';
import { toast } from 'sonner';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Welcome to the squad! Check your inbox.');
    setEmail('');
  };

  return (
    <section className="navy-section">
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-heading font-extrabold text-3xl md:text-4xl uppercase tracking-tight text-primary-foreground mb-4">
          Join the <span className="text-accent">Squad</span>
        </h2>
        <p className="text-primary-foreground/60 max-w-md mx-auto mb-8">
          Get first access to drops, exclusive deals, and athlete insights. No spam, just heat.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-accent text-sm"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-accent text-accent-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:brightness-110 transition-all"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
