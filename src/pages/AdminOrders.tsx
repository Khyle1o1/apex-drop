import { AdminLayout } from '@/components/layout/AdminLayout';
import { useOrderStore, type OrderStatus } from '@/lib/order-store';
import { formatPrice } from '@/lib/format';
import { useMemo, useState } from 'react';

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_verification: 'Payment For Verification',
  paid_for_pickup: 'Paid (For Pickup)',
  claimed_completed: 'Claimed / Completed',
  cancelled: 'Cancelled',
};

const filterOptions: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_verification', label: 'Payment For Verification' },
  { value: 'paid_for_pickup', label: 'Paid (For Pickup)' },
  { value: 'claimed_completed', label: 'Claimed / Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function AdminOrders() {
  const orders = useOrderStore((s) => s.orders);
  const updateStatus = useOrderStore((s) => s.updateStatus);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = filter === 'all' ? [...orders] : orders.filter((o) => o.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (o) =>
          o.transactionReference.toLowerCase().includes(q) ||
          o.buyerIdNumber.toLowerCase().includes(q),
      );
    }
    return result;
  }, [orders, filter, search]);

  const selected = filtered.find((o) => o.id === selectedOrderId) ?? filtered[0];

  const handleAdvance = (status: OrderStatus) => {
    if (!selected) return;
    updateStatus(selected.id, status);
  };

  return (
    <AdminLayout
      title="Orders"
      subtitle="View and advance Campus Store orders from pending to claimed."
    >
      <div className="w-full min-w-0">
        {/* Filter / search controls */}
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Economic Enterprise Unit view — verify payments and mark pickups as claimed.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-muted-foreground text-xs">Status</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="flex-1 border border-border rounded-md px-3 py-2 text-xs bg-background sm:flex-none"
              >
                {filterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              placeholder="Search by reference or ID number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-border rounded-md px-3 py-2 text-xs bg-background sm:w-auto sm:min-w-[200px]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-8 text-center text-sm text-muted-foreground">
            No orders found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Orders table/list */}
            <div className="space-y-3">
              {filtered.map((order) => (
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
                  <p className="text-xs mt-1">
                    {order.buyerName} • {order.items.length} item
                    {order.items.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs font-semibold mt-0.5">
                    {formatPrice(order.subtotal)}
                  </p>
                </button>
              ))}
            </div>

            {/* Detail */}
            {selected && (
              <div className="lg:col-span-2 space-y-6">
                <div className="border border-border rounded-xl p-6 bg-muted/30 space-y-4 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="font-heading font-bold text-sm tracking-wide mb-1">
                        {selected.transactionReference}
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="text-[11px] px-2 py-1 rounded-pill bg-muted text-muted-foreground">
                      {statusLabels[selected.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-heading font-bold text-xs tracking-wide mb-1">
                        Buyer
                      </h3>
                      <p>{selected.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{selected.buyerEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        ID Number: {selected.buyerIdNumber}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-xs tracking-wide mb-1">
                        Pickup & Payment
                      </h3>
                      <p>Pickup Only — University Economic Enterprise Unit</p>
                      <p className="text-xs text-muted-foreground">
                        Payment is done at the University Cashier.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Bring the official cashier receipt to claim your merch.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-xs tracking-wide mb-1">
                      Items
                    </h3>
                    <ul className="space-y-1">
                      {selected.items.map((item) => (
                        <li
                          key={`${item.productId}-${item.variantId}-${item.size}`}
                          className="flex justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate">
                              {item.product.title} × {item.quantity}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {item.variant.colorName}
                              {item.size ? ` • Size ${item.size}` : ''}
                            </p>
                          </div>
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

                <div className="border border-border rounded-xl p-6 text-sm space-y-3">
                  <h3 className="font-heading font-bold text-sm mb-1">Receipt & Status</h3>
                  {selected.receiptFileName ? (
                    <p className="text-xs text-muted-foreground">
                      Uploaded receipt: {selected.receiptFileName}{' '}
                      {selected.receiptNumber ? `(#${selected.receiptNumber})` : null}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No receipt uploaded yet by the buyer.
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.status === 'pending_payment' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('paid_for_pickup')}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-secondary transition-all"
                      >
                        Mark as Paid (For Pickup)
                      </button>
                    )}
                    {selected.status === 'payment_verification' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('paid_for_pickup')}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-secondary transition-all"
                      >
                        Verify and Mark as Paid (For Pickup)
                      </button>
                    )}
                    {selected.status === 'paid_for_pickup' && (
                      <button
                        type="button"
                        onClick={() => handleAdvance('claimed_completed')}
                        className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-secondary transition-all"
                      >
                        Mark as Claimed / Completed
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="mt-2 inline-flex px-4 py-2 border border-border rounded-md text-xs font-semibold hover:border-accent hover:text-accent transition-all"
                  >
                    Print Order Slip
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

