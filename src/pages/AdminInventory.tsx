import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Save, Search, Boxes, Info } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InventoryRow {
  inventoryId: string;
  variantSizeId: string;
  stock: number;
  reserved: number;
  updatedAt: string;
  size: string;
  sizeIsActive: boolean;
  variantId: string;
  variantName: string | null;
  color: string | null;
  priceOverride: string | null;
  variantIsActive: boolean;
  productId: string;
  productName: string;
  basePrice: string;
  productIsActive: boolean;
  categoryName: string | null;
  priceApplied: string;
  priceSource: 'variant' | 'base';
}

// ─── Stock Cell ───────────────────────────────────────────────────────────────

interface StockCellProps {
  row: InventoryRow;
}

function StockCell({ row }: StockCellProps) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState(String(row.stock));
  const isDirty = value !== String(row.stock);

  const mut = useMutation({
    mutationFn: (stock: number) =>
      apiJson<{ variantSizeId: string; stock: number }>(`/api/admin/inventory/${row.variantSizeId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ stock }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      toast.success(`Stock updated for ${row.productName} – ${row.variantName ?? ''} ${row.size}`);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update stock'),
  });

  const handleSave = () => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n < 0) { toast.error('Stock must be a non-negative integer'); return; }
    mut.mutate(n);
  };

  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
        className="h-7 w-20 text-xs text-right px-2"
        disabled={mut.isPending}
      />
      {isDirty && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleSave}
          disabled={mut.isPending}
          className="h-7 w-7 p-0"
          title="Save stock"
        >
          <Save className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// ─── Status Toggle ────────────────────────────────────────────────────────────

interface StatusToggleProps {
  row: InventoryRow;
}

function StatusToggle({ row }: StatusToggleProps) {
  const queryClient = useQueryClient();
  const mut = useMutation({
    mutationFn: (isActive: boolean) =>
      apiJson<{ variantSizeId: string; isActive: boolean }>(`/api/admin/inventory/${row.variantSizeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update status'),
  });

  return (
    <div className="flex items-center gap-1.5">
      <Switch
        checked={row.sizeIsActive}
        onCheckedChange={(v) => mut.mutate(v)}
        disabled={mut.isPending}
        className="scale-90"
      />
      <Badge
        variant="secondary"
        className={
          row.sizeIsActive
            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 text-[11px]'
            : 'bg-zinc-100 text-zinc-500 text-[11px]'
        }
      >
        {row.sizeIsActive ? 'Active' : 'Inactive'}
      </Badge>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminInventory() {
  const [search, setSearch] = useState('');

  const { data: rows = [], isLoading } = useQuery<InventoryRow[]>({
    queryKey: ['admin-inventory'],
    queryFn: () => apiJson<InventoryRow[]>('/api/admin/inventory'),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (r) =>
        r.productName.toLowerCase().includes(q) ||
        (r.variantName?.toLowerCase().includes(q) ?? false) ||
        (r.color?.toLowerCase().includes(q) ?? false) ||
        r.size.toLowerCase().includes(q) ||
        (r.categoryName?.toLowerCase().includes(q) ?? false)
    );
  }, [rows, search]);

  const totalUnits = rows.reduce((sum, r) => sum + r.stock, 0);
  const lowStockCount = rows.filter((r) => r.stock > 0 && r.stock <= 5).length;
  const outOfStockCount = rows.filter((r) => r.stock === 0).length;

  return (
    <AdminLayout
      title="Inventory / Variants"
      subtitle="Manage stock quantities at the variant-size level."
    >
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="space-y-0.5">
          <p className="font-medium">Manage stock quantities here.</p>
          <p className="text-xs text-muted-foreground">
            Product details, variants, colors, and sizes are managed in the{' '}
            <a href="/admin/products" className="underline hover:text-foreground">
              Products
            </a>{' '}
            page.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Units</p>
          <p className="mt-1 text-2xl font-bold font-heading">{totalUnits.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wide">Low Stock (≤5)</p>
          <p className="mt-1 text-2xl font-bold font-heading text-amber-600">{lowStockCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-destructive font-medium uppercase tracking-wide">Out of Stock</p>
          <p className="mt-1 text-2xl font-bold font-heading text-destructive">{outOfStockCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search product, variant, size…"
          className="pl-9 h-9 text-sm w-full"
        />
      </div>

      {/* Inventory table */}
      <div className="rounded-xl border border-border bg-background overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Loading inventory…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Boxes className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search ? 'No results for your search.' : 'No inventory records found.'}
            </p>
            {!search && rows.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Add products with variants in the{' '}
                <a href="/admin/products" className="underline">
                  Products
                </a>{' '}
                page first.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Variant / Color
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Size
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr
                    key={row.variantSizeId}
                    className={`hover:bg-muted/20 transition-colors ${
                      row.stock === 0 ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-2.5">
                      <span className="font-medium text-foreground">{row.productName}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">{row.categoryName ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-sm">{row.variantName ?? row.color ?? '—'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center rounded border border-border bg-muted/40 px-2 py-0.5 text-xs font-mono font-semibold">
                        {row.size}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-mono text-sm">
                          {formatPrice(Number(row.priceApplied))}
                        </span>
                        {row.priceSource === 'variant' && (
                          <span className="text-[10px] text-muted-foreground">variant price</span>
                        )}
                        {row.priceSource === 'base' && (
                          <span className="text-[10px] text-muted-foreground">base price</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <StockCell row={row} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusToggle row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
              Showing {filtered.length} of {rows.length} variant-size records
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
