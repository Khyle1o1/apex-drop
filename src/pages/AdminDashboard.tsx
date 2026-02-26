import { AdminLayout } from '@/components/layout/AdminLayout';
import { useOrderStore } from '@/lib/order-store';
import { formatPrice } from '@/lib/format';
import type { OrderStatus } from '@/lib/order-store';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock, Inbox, ScanSearch, Truck } from 'lucide-react';

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: 'Pending Payment',
  payment_verification: 'Payment For Verification',
  paid_for_pickup: 'Paid (For Pickup)',
  claimed_completed: 'Claimed / Completed',
  cancelled: 'Cancelled',
};

const quickFilters: { value: OrderStatus; label: string }[] = [
  { value: 'pending_payment', label: 'Pending Payment' },
  { value: 'payment_verification', label: 'Payment For Verification' },
  { value: 'paid_for_pickup', label: 'Paid (For Pickup)' },
  { value: 'claimed_completed', label: 'Claimed' },
];

const getStatusBadgeClasses = (status: OrderStatus) => {
  switch (status) {
    case 'pending_payment':
      return 'bg-amber-50 text-amber-700 ring-amber-100';
    case 'payment_verification':
      return 'bg-sky-50 text-sky-700 ring-sky-100';
    case 'paid_for_pickup':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-100';
    case 'claimed_completed':
      return 'bg-slate-50 text-slate-700 ring-slate-100';
    case 'cancelled':
    default:
      return 'bg-zinc-50 text-zinc-700 ring-zinc-100';
  }
};

export default function AdminDashboard() {
  const orders = useOrderStore((s) => s.orders);
  const navigate = useNavigate();
  const [filter, setFilter] = useState<OrderStatus>('pending_payment');
  const [search, setSearch] = useState('');

  const { pendingCount, paidForPickupCount, claimedCount, totalSales, statusCounts } = useMemo(() => {
    let pending = 0;
    let paidForPickup = 0;
    let claimed = 0;
    let sales = 0;
    const counts: Record<OrderStatus, number> = {
      pending_payment: 0,
      payment_verification: 0,
      paid_for_pickup: 0,
      claimed_completed: 0,
      cancelled: 0,
    };

    for (const o of orders) {
      counts[o.status] += 1;
      if (o.status === 'pending_payment') pending += 1;
      if (o.status === 'paid_for_pickup') paidForPickup += 1;
      if (o.status === 'claimed_completed') claimed += 1;
      if (o.status === 'paid_for_pickup' || o.status === 'claimed_completed') {
        sales += o.subtotal;
      }
    }

    return {
      pendingCount: pending,
      paidForPickupCount: paidForPickup,
      claimedCount: claimed,
      totalSales: sales,
      statusCounts: counts,
    };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...orders]
      .filter((o) => o.status === filter)
      .filter((o) =>
        q
          ? o.transactionReference.toLowerCase().includes(q) ||
            o.buyerName.toLowerCase().includes(q) ||
            o.buyerIdNumber.toLowerCase().includes(q)
          : true,
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, filter, search]);

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Pending orders and pickup pipeline overview for the Campus Store."
    >
      <div className="space-y-6">
        <section
          aria-label="Key metrics"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
        >
          <div className="flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-amber-800/80">
                  Pending Orders
                </p>
                <p className="font-heading text-3xl font-extrabold text-amber-900">
                  {pendingCount}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-amber-900/80">
              Orders still awaiting payment from students or staff.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-muted/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Paid (For Pickup)
                </p>
                <p className="font-heading text-3xl font-extrabold text-foreground">
                  {paidForPickupCount}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Fully paid orders ready to be claimed at the Campus Store.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-muted/60 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Claimed / Completed
                </p>
                <p className="font-heading text-3xl font-extrabold text-foreground">
                  {claimedCount}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Successfully claimed orders for this demo environment.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total Sales (based on orders)
                </p>
                <p className="font-heading text-3xl font-extrabold text-foreground">
                  {totalSales > 0 ? formatPrice(totalSales) : '₱0'}
                </p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Includes only orders marked as paid or claimed.
            </p>
          </div>
        </section>

        <section
          aria-label="Pending orders table"
          className="overflow-hidden rounded-2xl border border-border bg-background shadow-sm"
        >
          <div className="flex flex-col gap-3 border-b border-border/80 px-4 py-4 md:px-6">
            {/* Title row */}
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-heading text-base font-semibold tracking-tight md:text-lg">
                  Orders Queue
                </h2>
                <p className="mt-0.5 text-[11px] text-muted-foreground md:text-xs">
                  Newest first. Verify payments and mark orders for pickup or claiming.
                </p>
              </div>
            </div>
            {/* Controls row */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-wrap">
              <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
                  <ScanSearch className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ref, customer, or ID number"
                  className="h-9 w-full rounded-full border border-border bg-muted/40 pl-9 pr-3 text-xs outline-none ring-primary/30 placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {quickFilters.map((q) => (
                  <button
                    key={q.value}
                    type="button"
                    onClick={() => setFilter(q.value)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                      filter === q.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/60'
                    }`}
                  >
                    <span>{q.label}</span>
                    <span className="rounded-full bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                      {statusCounts[q.value] ?? 0}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex min-h-[160px] flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 text-muted-foreground">
                  <Inbox className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">No pending orders right now.</p>
                <p className="max-w-md text-xs text-muted-foreground">
                  Check back later or switch to a different status filter to view all orders in the
                  system.
                </p>
              </div>
            ) : (
              <table className="min-w-[760px] w-full text-xs md:text-sm">
                <thead className="bg-muted/70 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Transaction Ref</th>
                    <th className="px-4 py-2 text-left font-semibold">Date</th>
                    <th className="px-4 py-2 text-left font-semibold">Customer</th>
                    <th className="px-4 py-2 text-left font-semibold">ID Number</th>
                    <th className="px-4 py-2 text-right font-semibold">Total</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o, index) => {
                    const isEven = index % 2 === 0;
                    const statusClass = getStatusBadgeClasses(o.status);

                    let actionLabel = 'View';
                    if (o.status === 'payment_verification') actionLabel = 'Verify';
                    if (o.status === 'paid_for_pickup') actionLabel = 'Mark Claimed';

                    return (
                      <tr
                        key={o.id}
                        className={`border-t border-border/70 text-xs transition-colors hover:bg-muted/40 ${
                          isEven ? 'bg-background' : 'bg-muted/20'
                        }`}
                      >
                        <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px]">
                          {o.transactionReference}
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 text-[11px]">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td className="max-w-[180px] px-4 py-2 text-xs">
                          <span className="line-clamp-1">{o.buyerName}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-2 font-mono text-[11px]">
                          {o.buyerIdNumber}
                        </td>
                        <td className="px-4 py-2 text-right text-xs font-semibold">
                          {formatPrice(o.subtotal)}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${statusClass}`}
                          >
                            {statusLabels[o.status]}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => navigate('/admin/orders')}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-3 py-1 text-[11px] font-semibold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary"
                          >
                            {actionLabel}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

