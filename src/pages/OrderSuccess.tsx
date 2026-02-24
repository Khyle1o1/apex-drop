import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useOrderStore } from '@/lib/order-store';
import { formatPrice } from '@/lib/format';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref') || '';
  const getOrderByReference = useOrderStore(s => s.getOrderByReference);
  const order = ref ? getOrderByReference(ref) : undefined;

  if (!order) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center max-w-lg">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-4">
            Order Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            We couldn't find your transaction reference. Please check your Orders page.
          </p>
          <Link
            to="/orders"
            className="inline-flex px-8 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all"
          >
            Go to Orders
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-accent" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-4">
          Order Placed — Pending Payment
        </h1>
        <p className="text-muted-foreground mb-2">
          Your pickup order has been created. Please pay at the University Cashier and keep the official receipt.
        </p>
        <p className="text-sm font-mono bg-muted px-4 py-2 rounded-lg inline-block mb-8">
          Transaction Reference: {order.transactionReference}
        </p>
        <div className="text-left text-sm text-muted-foreground mb-8 space-y-3">
          <div>
            <h2 className="font-heading font-bold text-xs tracking-wider text-foreground mb-1">
              Buyer
            </h2>
            <p>{order.buyerName}</p>
            <p>{order.buyerEmail}</p>
          </div>
          <div>
            <h2 className="font-heading font-bold text-xs tracking-wider text-foreground mb-1">
              Items
            </h2>
            <ul className="space-y-1">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.variantId}-${item.size}`} className="flex justify-between gap-2">
                  <span className="truncate">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    {formatPrice((item.variant.priceOverride ?? item.product.basePrice) * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-between pt-2 border-t border-border">
            <span className="font-bold">Total</span>
            <span className="font-bold">{formatPrice(order.subtotal)}</span>
          </div>
          <div>
            <h2 className="font-heading font-bold text-xs tracking-wider text-foreground mb-1">
              Pickup
            </h2>
            <p>Pickup Only — University Economic Enterprise Unit</p>
            <p className="text-xs">Bring the official cashier receipt to claim your merch.</p>
          </div>
        </div>
        <div>
          <button
            type="button"
            className="inline-flex px-6 py-3.5 bg-muted text-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-muted/80 transition-all mr-2 mb-3"
          >
            Download Transaction Slip (PDF)
          </button>
          <Link
            to="/orders"
            className="inline-flex px-6 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all mr-2 mb-3"
          >
            Go to Orders
          </Link>
          <Link
            to="/shop"
            className="inline-flex px-6 py-3.5 border border-border text-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:border-accent hover:text-accent transition-all mb-3"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </Layout>
  );
}
