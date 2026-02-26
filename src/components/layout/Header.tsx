import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { useSettingsStore } from '@/lib/settings-store';
import { useState } from 'react';

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?category=Limited+Edition', label: 'Limited Edition' },
  { to: '/about', label: 'About' },
  { to: '/support', label: 'Support' },
];

export default function Header() {
  const count = useCartStore((s) => s.getCount());
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const { systemBanner } = useSettingsStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-xs text-center py-2 px-4">
        {systemBanner}
      </div>

      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/icon.png"
              alt="Campus Store logo"
              className="w-9 h-9 rounded-lg object-cover "
            />
            <div className="flex flex-col leading-none">
              <span className="font-heading font-extrabold text-base tracking-tight text-foreground">
                Campus Store
              </span>
              <span className="text-[10px] text-muted-foreground tracking-wide hidden sm:block">Official School Merch</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {!isAdmin && (
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-colors hover:text-accent relative
                  ${location.pathname === link.to.split('?')[0] ? 'text-foreground' : 'text-muted-foreground'}
                  after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full
                `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {!isAdmin && (
              <button className="text-foreground hover:text-accent transition-colors" aria-label="Search">
                <Search className="w-5 h-5" />
              </button>
            )}
            <button
              className="hidden sm:flex items-center gap-1 text-foreground hover:text-accent transition-colors text-sm"
              aria-label="Account"
              onClick={() => {
                if (user) {
                  navigate('/profile');
                } else {
                  navigate('/login');
                }
              }}
            >
              <User className="w-5 h-5" />
              {user ? (
                <>
                  <span className="hidden md:inline-block truncate max-w-[100px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      logout();
                      navigate('/');
                    }}
                    className="text-[11px] font-semibold text-muted-foreground hover:text-destructive ml-1"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <span className="hidden md:inline-block">Login</span>
              )}
            </button>
            {!isAdmin && (
              <Link
                to="/cart"
                className="relative text-foreground hover:text-accent transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-pill">
                    {count}
                  </span>
                )}
              </Link>
            )}
            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 top-[calc(2rem+4rem)] z-50 bg-background animate-slide-in">
            <nav className="flex flex-col p-6 gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-semibold text-foreground hover:text-accent transition-colors py-2 border-b border-border"
                >
                  {link.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  if (user) {
                    logout();
                    navigate('/');
                  } else {
                    navigate('/login');
                  }
                }}
                className="text-base font-semibold text-foreground hover:text-accent transition-colors py-2 border-t border-border mt-2 text-left"
              >
                {user ? 'Logout' : 'Login'}
              </button>
              <Link
                to="/support"
                onClick={() => setMobileOpen(false)}
                className="text-base font-semibold text-muted-foreground hover:text-accent transition-colors py-2"
              >
                Help & Support
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
