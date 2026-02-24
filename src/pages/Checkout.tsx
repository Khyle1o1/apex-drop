import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import { useAuthStore } from '@/lib/auth-store';
import { useOrderStore } from '@/lib/order-store';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = getTotal();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const updateCurrentUser = useAuthStore(s => s.updateCurrentUser);
  const createOrder = useOrderStore(s => s.createOrder);

  const [notes, setNotes] = useState('');
  const [buyerName, setBuyerName] = useState(user?.fullName ?? '');
  const [buyerAddress, setBuyerAddress] = useState(user?.address ?? '');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?from=/checkout&reason=login_required`, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setBuyerName(user.fullName);
      setBuyerAddress(user.address);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const finalName = buyerName.trim() || user.fullName;
    const finalAddress = buyerAddress.trim() || user.address;
    updateCurrentUser({ fullName: finalName, address: finalAddress });
    const userForOrder = { ...user, fullName: finalName, address: finalAddress };
    const order = createOrder({
      user: userForOrder,
      items,
      subtotal: total,
      notes: notes.trim() || undefined,
    });
    clearCart();
    navigate(`/order/success?ref=${encodeURIComponent(order.transactionReference)}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Buyer Information */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm mb-2">Buyer Information</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  required
                  placeholder="Full Name"
                  value={buyerName}
                  onChange={e => setBuyerName(e.target.value)}
                  className={inputClass}
                />
                <input
                  required
                  placeholder="ID Number"
                  value={user?.idNumber || ''}
                  readOnly
                  className={`${inputClass} bg-muted cursor-not-allowed`}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={user?.email || ''}
                  readOnly
                  className={`${inputClass} bg-muted cursor-not-allowed`}
                />
                <input
                  placeholder="Address"
                  value={buyerAddress}
                  onChange={e => setBuyerAddress(e.target.value)}
                  className={inputClass}
                />
              </div>
              <textarea
                placeholder="Notes (size preferences, special requests, etc.)"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className={`${inputClass} resize-none min-h-[80px]`}
              />
            </fieldset>

            {/* Pickup Details */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm mb-2">Pickup Details</legend>
              <div className="p-4 border border-border rounded-lg bg-muted/30 text-sm space-y-1">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Pickup Location</span>
                  <span className="font-semibold text-right">
                    University Economic Enterprise Unit
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Pickup Schedule</span>
                  <span className="font-semibold text-right">Mon–Fri, 8AM–5PM</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Bring your official receipt when claiming your merch.
                </p>
              </div>
            </fieldset>

            {/* Payment Method */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm mb-2">Payment Method</legend>
              <div className="p-6 border border-border rounded-lg bg-muted/30 text-sm space-y-3">
                <p className="font-semibold">
                  Payment is done at the University Cashier.
                </p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-sm">
                  <li>Place order to generate a transaction reference.</li>
                  <li>Go to University Cashier and pay.</li>
                  <li>Present the Cashier Receipt at the University Economic Enterprise Unit to claim the item.</li>
                </ol>
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all min-h-[48px]"
            >
              Place Order
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 h-fit lg:sticky lg:top-28 order-first lg:order-last">
            <button
              className="flex items-center justify-between w-full lg:cursor-default"
              onClick={() => setSummaryOpen(!summaryOpen)}
              type="button"
            >
              <h2 className="font-heading font-bold text-lg">Order Summary</h2>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${summaryOpen ? 'block' : 'hidden lg:block'} mt-4`}>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={`${item.productId}-${item.variantId}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="font-semibold whitespace-nowrap">
                      {formatPrice((item.variant.priceOverride ?? item.product.basePrice) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  Pickup Only — University Economic Enterprise Unit
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
