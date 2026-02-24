import { AdminLayout } from '@/components/layout/AdminLayout';
import { products } from '@/lib/products';

export default function AdminCategories() {
  const categoryMap = new Map<string, number>();
  for (const p of products) {
    categoryMap.set(p.category, (categoryMap.get(p.category) ?? 0) + 1);
  }

  const categories = Array.from(categoryMap.entries());

  return (
    <AdminLayout
      title="Categories"
      subtitle="High-level overview of product categories in the catalog."
    >
      <div className="max-w-xl border border-border rounded-xl bg-background p-4 md:p-6 space-y-3">
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">No categories found.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {categories.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
              >
                <span className="font-semibold">{name}</span>
                <span className="text-xs text-muted-foreground">{count} products</span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-[11px] text-muted-foreground">
          In a full CMS, you would add, rename, and manage which products belong to each category here.
        </p>
      </div>
    </AdminLayout>
  );
}

