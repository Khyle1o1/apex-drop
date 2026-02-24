import { AdminLayout } from '@/components/layout/AdminLayout';
import { products } from '@/lib/products';

export default function AdminInventory() {
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      productTitle: p.title,
      category: p.category,
      variantId: v.variantId,
      colorName: v.colorName,
      stockStatus: v.stockStatus,
    })),
  );

  return (
    <AdminLayout
      title="Inventory / Variants"
      subtitle="Quick view of stock status per product variant."
    >
      <div className="border border-border rounded-xl bg-background p-4 md:p-6 overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Product</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Category</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Variant</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.variantId} className="border-t border-border/80">
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.productTitle}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.category}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{r.colorName}</td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                      r.stockStatus === 'inStock'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {r.stockStatus === 'inStock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

