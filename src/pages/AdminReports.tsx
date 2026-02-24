import { AdminLayout } from '@/components/layout/AdminLayout';
import { useOrderStore } from '@/lib/order-store';

export default function AdminReports() {
  const orders = useOrderStore((s) => s.orders);

  const byStatus = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const productTotals = new Map<string, number>();
  for (const o of orders) {
    for (const item of o.items) {
      const key = item.product.title;
      productTotals.set(key, (productTotals.get(key) ?? 0) + item.quantity);
    }
  }
  const topProducts = Array.from(productTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <AdminLayout
      title="Reports"
      subtitle="Lightweight summary of orders and most purchased products."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <section className="border border-border rounded-xl bg-background p-4 md:p-6 space-y-3">
          <h2 className="font-heading font-semibold text-sm">Orders by Status</h2>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {Object.entries(byStatus).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between">
                  <span className="capitalize text-xs">{status.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-border rounded-xl bg-background p-4 md:p-6 space-y-3">
          <h2 className="font-heading font-semibold text-sm">Most Purchased Products</h2>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No purchase data yet.</p>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {topProducts.map(([title, qty]) => (
                <li key={title} className="flex items-center justify-between">
                  <span>{title}</span>
                  <span className="text-xs text-muted-foreground">{qty} pcs</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

