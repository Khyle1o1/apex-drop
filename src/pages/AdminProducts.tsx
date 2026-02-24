import { AdminLayout } from '@/components/layout/AdminLayout';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/format';

export default function AdminProducts() {
  return (
    <AdminLayout
      title="Products"
      subtitle="Manage the campus merch catalog. (Demo: read-only from seeded products.)"
    >
      <div className="border border-border rounded-xl bg-background p-4 md:p-6 overflow-x-auto">
        <table className="min-w-full text-xs md:text-sm">
          <thead className="bg-muted/40">
            <tr className="text-left">
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Name</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Category</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Base Price</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Badge</th>
              <th className="px-4 py-2 font-semibold whitespace-nowrap">Variants</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border/80 align-top">
                <td className="px-4 py-2 whitespace-nowrap">
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-[11px] text-muted-foreground">{p.slug}</div>
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-xs">{p.category}</td>
                <td className="px-4 py-2 text-xs">{formatPrice(p.basePrice)}</td>
                <td className="px-4 py-2 text-xs">{p.badge ?? '—'}</td>
                <td className="px-4 py-2 text-xs">
                  <div className="flex flex-wrap gap-1">
                    {p.variants.map((v) => (
                      <span
                        key={v.variantId}
                        className="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-[11px] gap-1"
                      >
                        <span
                          className="inline-block w-2 h-2 rounded-full border border-border"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span>{v.colorName}</span>
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

