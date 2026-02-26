import { AdminLayout } from '@/components/layout/AdminLayout';
import { fetchCatalogProducts, type Product } from '@/lib/products';
import { useQuery } from '@tanstack/react-query';

export default function AdminPromotions() {
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['catalog-products'],
    queryFn: fetchCatalogProducts,
  });

  const limited = products.filter(
    (p) => p.category === 'Limited Edition' || p.badge === 'Limited',
  );

  return (
    <AdminLayout
      title="Promotions / Limited Edition"
      subtitle="Manage limited drops and featured promotional items."
    >
      <div className="border border-border rounded-xl bg-background p-4 md:p-6 space-y-3">
        {limited.length === 0 ? (
          <p className="text-sm text-muted-foreground">No limited edition products configured.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {limited.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {p.category} • {p.badge ?? 'Limited'}
                  </p>
                </div>
                <span className="text-[11px] text-accent font-semibold uppercase tracking-wide">
                  Limited Drop
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-muted-foreground">
          In a full CMS, you could enable/disable products for specific promo windows or events here.
        </p>
      </div>
    </AdminLayout>
  );
}

