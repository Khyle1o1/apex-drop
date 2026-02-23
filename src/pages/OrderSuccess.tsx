import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function OrderSuccess() {
  const orderNumber = `APX-${Date.now().toString(36).toUpperCase()}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl uppercase tracking-tight mb-4">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-2">Thank you for your order. We're getting it ready.</p>
        <p className="text-sm font-mono bg-muted px-4 py-2 rounded-lg inline-block mb-8">
          Order #{orderNumber}
        </p>
        <div>
          <Link
            to="/shop"
            className="inline-flex px-8 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-secondary transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}
