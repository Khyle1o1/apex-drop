import { AdminLayout } from '@/components/layout/AdminLayout';
import { products } from '@/lib/products';
import { useInventoryStore } from '@/lib/inventory-store';

export default function AdminInventory() {
  const sizes = useInventoryStore((s) => s.sizes);
  const setQuantity = useInventoryStore((s) => s.setQuantity);
  const toggleActive = useInventoryStore((s) => s.toggleActive);

  const rows = sizes.map((s) => {
    const product = products.find((p) => p.id === s.productId);
    const variant = product?.variants.find((v) => v.variantId === s.variantId);
    return {
      id: s.id,
      productTitle: product?.title ?? 'Unknown product',
      category: product?.category ?? '—',
      variantName: variant?.colorName ?? '—',
      sizeLabel: s.sizeLabel,
      quantity: s.quantity,
      isActive: s.isActive,
    };
  });

  return (
    <AdminLayout
      title="Inventory / Variants"
      subtitle="Quick view and inline edit of stock per size variant."
    >
      <div className="border border-border rounded-xl bg-background p-4 md:p-6 overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Product</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Category</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Variant</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Size</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Stock</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border/80">
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.productTitle}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.category}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.variantName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.sizeLabel}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">
                  <input
                    type="number"
                    min={0}
                    className="w-20 px-2 py-1 border border-border rounded-md bg-background text-[11px]"
                    value={r.quantity}
                    onChange={(e) =>
                      setQuantity(
                        r.id,
                        Number.isNaN(parseInt(e.target.value, 10))
                          ? 0
                          : parseInt(e.target.value, 10),
                      )
                    }
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">
                  <label className="inline-flex items-center gap-1">
                    <input
                      type="checkbox"
                      className="w-3 h-3"
                      checked={r.isActive && r.quantity > 0}
                      onChange={(e) => toggleActive(r.id, e.target.checked)}
                    />
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                        r.isActive && r.quantity > 0
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {r.isActive && r.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </label>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-xs text-muted-foreground text-center"
                >
                  No per-size inventory entries yet. Define sizes from the Products page.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

