import { Link } from 'react-router-dom';

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'Apparel', to: '/shop?category=Apparel' },
    { label: 'Accessories', to: '/shop?category=Accessories' },
    { label: 'Stationery', to: '/shop?category=Stationery' },
    { label: 'Bags', to: '/shop?category=Bags' },
  ],
  Support: [
    { label: 'FAQ', to: '/support' },
    { label: 'Contact Us', to: '/support' },
    { label: 'Shipping Info', to: '/support' },
    { label: 'Returns', to: '/support' },
  ],
  Company: [
    { label: 'About Us', to: '/about' },
    { label: 'Campus Life', to: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="navy-section text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand + Info */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-heading font-black text-sm">C</span>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight">Campus Store</span>
            </div>
            <div className="text-sm text-primary-foreground/60 leading-relaxed space-y-2">
              <p>University Ave, Main Campus<br />Building 5, Ground Floor</p>
              <p>Mon–Fri: 8AM–6PM<br />Sat: 9AM–3PM</p>
              <p>store@campus.edu.ph</p>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-sm tracking-wider mb-4 text-accent">
                {title}
              </h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-primary-foreground/60 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} Campus Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
