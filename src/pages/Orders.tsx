import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/lib/auth-store';
import { useOrderStore, type OrderStatus } from '@/lib/order-store';
import { formatPrice } from '@/lib/format';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_verification: 'Payment For Verification',
  paid_for_pickup: 'Paid (For Pickup)',
  claimed_completed: 'Claimed / Completed',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const user = useAuthStore((s) => s.user);
  const getOrdersForEmail = useOrderStore((s) => s.getOrdersForEmail);
  const submitReceipt = useOrderStore((s) => s.submitReceipt);
  const navigate = useNavigate();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?from=/orders', { replace: true });
    }
  }, [user, navigate]);

  const orders = useMemo(() => {
    if (!user) return [];
    return getOrdersForEmail(user.email);
  }, [user, getOrdersForEmail]);

  const selected = orders.find((o) => o.id === selectedOrderId) ?? orders[0];

  const handleReceiptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!receiptFileName) return;
    submitReceipt(selected.id, { receiptFileName, receiptNumber: receiptNumber || undefined });
    setReceiptFileName('');
    setReceiptNumber('');
  };

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-2">
          Your Orders
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Track your campus merch pickup orders. Pay at the University Cashier and bring the official receipt.
        </p>

        {orders.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            No orders yet. Place a pickup order from the shop to see it here.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Orders list */}
            <div className="lg:col-span-1 space-y-3">
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full text-left p-4 border rounded-lg text-sm transition-all ${
                    selected?.id === order.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-foreground/40'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-xs">{order.transactionReference}</span>
                    <span className="text-[11px] px-2 py-1 rounded-pill bg-muted text-muted-foreground">
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold mt-1">
                    {formatPrice(order.subtotal)} • {order.items.length} item
                    {order.items.length === 1 ? '' : 's'}
                  </p>
                </button>
              ))}
            </div>

            {/* Order detail */}
            {selected && (
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-border rounded-xl p-6 bg-muted/30 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-heading font-bold text-sm tracking-wide">
                        Transaction Reference
                      </h2>
                      <p className="font-mono text-xs">{selected.transactionReference}</p>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-pill bg-muted text-muted-foreground">
                      {statusLabels[selected.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h3 className="font-heading font-bold text-xs tracking-wide mb-1">Buyer</h3>
                      <p>{selected.buyerName}</p>
                      <p className="text-muted-foreground text-xs">{selected.buyerEmail}</p>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xs tracking-wide mb-1">Pickup</h3>
                      <p>Pickup Only — University Economic Enterprise Unit</p>
                      <p className="text-muted-foreground text-xs">
                        Bring the official cashier receipt to claim your merch.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs tracking-wide mb-2">Items</h3>
                    <ul className="space-y-1 text-sm">
                      {selected.items.map((item) => (
                        <li
                          key={`${item.productId}-${item.variantId}-${item.size}`}
                          className="flex justify-between gap-2"
                        >
                          <span className="truncate">
                            {item.product.title} × {item.quantity}
                          </span>
                          <span className="font-semibold whitespace-nowrap">
                            {formatPrice(
                              (item.variant.priceOverride ?? item.product.basePrice) * item.quantity,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between pt-2 border-t border-border mt-2 text-sm font-bold">
                      <span>Total</span>
                      <span>{formatPrice(selected.subtotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Receipt upload */}
                <form
                  onSubmit={handleReceiptSubmit}
                  className="border border-border rounded-xl p-6 space-y-4 text-sm"
                >
                  <h3 className="font-heading font-bold text-sm">
                    Mark as Paid / Upload Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Upload a photo or PDF of your official cashier receipt so the Economic
                    Enterprise Unit can verify your payment.
                  </p>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Receipt Upload
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setReceiptFileName(file ? file.name : '');
                      }}
                      className="block w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                    />
                    {selected.receiptFileName && (
                      <p className="text-[11px] text-muted-foreground">
                        Current: {selected.receiptFileName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Receipt Number (optional)
                    </label>
                    <input
                      type="text"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-xs bg-background"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-primary text-primary-foreground font-heading font-bold text-xs tracking-wider rounded-md hover:bg-secondary transition-all"
                  >
                    Submit Receipt
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}

