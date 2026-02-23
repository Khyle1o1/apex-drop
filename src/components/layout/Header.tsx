import { Link, useLocation } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useState } from 'react';

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=Limited+Drops', label: 'Collections' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
];

export default function Header() {
  const count = useCartStore((s) => s.getCount());
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
            <span className="text-primary-foreground font-heading font-black text-sm">A</span>
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tight text-foreground uppercase">
            Apex
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-semibold uppercase tracking-wide transition-colors hover:text-accent relative
                ${location.pathname === link.to.split('?')[0] ? 'text-foreground' : 'text-muted-foreground'}
                after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full
              `}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center gap-4">
          <button className="text-foreground hover:text-accent transition-colors" aria-label="Search">
            <Search className="w-5 h-5" />
          </button>
          <button className="hidden sm:block text-foreground hover:text-accent transition-colors" aria-label="Account">
            <User className="w-5 h-5" />
          </button>
          <Link to="/cart" className="relative text-foreground hover:text-accent transition-colors" aria-label="Cart">
            <ShoppingBag className="w-5 h-5" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-pill">
                {count}
              </span>
            )}
          </Link>
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background animate-slide-in">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold uppercase tracking-wide text-foreground hover:text-accent transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
