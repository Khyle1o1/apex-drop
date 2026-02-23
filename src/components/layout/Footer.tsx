import { Link } from 'react-router-dom';

const footerLinks = {
  Shop: [
    { label: 'All Products', to: '/shop' },
    { label: 'Apparel', to: '/shop?category=Apparel' },
    { label: 'Equipment', to: '/shop?category=Equipment' },
    { label: 'Accessories', to: '/shop?category=Accessories' },
  ],
  Support: [
    { label: 'FAQ', to: '/support' },
    { label: 'Contact Us', to: '/support' },
    { label: 'Shipping', to: '/support' },
    { label: 'Returns', to: '/support' },
  ],
  Company: [
    { label: 'About', to: '/about' },
    { label: 'Careers', to: '/about' },
    { label: 'Press', to: '/about' },
  ],
};

export default function Footer() {
  return (
    <footer className="navy-section text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center">
                <span className="text-accent-foreground font-heading font-black text-sm">A</span>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight uppercase">Apex</span>
            </div>
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              Born from competition. Built for athletes who demand more from their gear.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-accent">
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
          © {new Date().getFullYear()} Apex Athletics. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
