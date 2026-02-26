import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { formatPrice } from "@/lib/format";
import { apiJson, apiFetch } from "@/lib/api";

interface AdminProduct {
  id: string;
  name: string;
  categoryName: string | null;
  basePrice: string;
  isActive: boolean;
}

interface AdminVariant {
  id: string;
  sku: string;
  variantName: string | null;
  size: string | null;
  color: string | null;
  isActive: boolean;
  stock: number | null;
  reserved: number | null;
}

export default function AdminProducts() {
  const queryClient = useQueryClient();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: () => apiJson<AdminProduct[]>("/api/admin/products"),
  });

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const effectiveSelectedId = selectedProductId ?? products?.[0]?.id ?? null;
  const selectedProduct = products?.find((p) => p.id === effectiveSelectedId) ?? null;

  const {
    data: variants,
    isLoading: variantsLoading,
  } = useQuery({
    queryKey: ["adminProductVariants", effectiveSelectedId],
    queryFn: () =>
      apiJson<AdminVariant[]>(`/api/admin/products/${effectiveSelectedId}/variants`),
    enabled: !!effectiveSelectedId,
  });

  const updateVariantMutation = useMutation({
    mutationFn: async (payload: { id: string; stock?: number; isActive?: boolean }) => {
      return apiJson<AdminVariant>(`/api/admin/variants/${payload.id}`, {
        method: "PATCH",
        body: JSON.stringify({ stock: payload.stock, isActive: payload.isActive }),
      });
    },
    onSuccess: (_data, _variables) => {
      if (effectiveSelectedId) {
        queryClient.invalidateQueries({ queryKey: ["adminProductVariants", effectiveSelectedId] });
      }
    },
  });

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage the campus merch catalog and stock directly from the database."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-xl bg-background p-4 md:p-6 overflow-x-auto">
          {productsLoading ? (
            <p className="text-xs text-muted-foreground">Loading products…</p>
          ) : !products || products.length === 0 ? (
            <p className="text-xs text-muted-foreground">No products found in the database.</p>
          ) : (
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Category</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Base Price</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-t border-border/80 align-top cursor-pointer ${
                      selectedProduct?.id === p.id ? "bg-muted/40" : ""
                    }`}
                    onClick={() => setSelectedProductId(p.id)}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="font-semibold">{p.name}</div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">
                      {p.categoryName ?? "Uncategorized"}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {formatPrice(Number(p.basePrice ?? 0))}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {p.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[11px]">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[11px]">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedProduct && (
          <div className="border border-border rounded-xl bg-background p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-bold text-sm">Variants &amp; Stock</h2>
                <p className="text-xs text-muted-foreground">
                  Manage stock for <span className="font-semibold">{selectedProduct.name}</span>{" "}
                  from the database.
                </p>
              </div>
            </div>

            {variantsLoading ? (
              <p className="text-xs text-muted-foreground">Loading variants…</p>
            ) : !variants || variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No variants defined yet for this product.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-[11px]">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="px-2 py-1 font-semibold">SKU</th>
                      <th className="px-2 py-1 font-semibold">Variant</th>
                      <th className="px-2 py-1 font-semibold">Size</th>
                      <th className="px-2 py-1 font-semibold">Stock</th>
                      <th className="px-2 py-1 font-semibold">Enabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variants.map((v) => (
                      <tr key={v.id} className="border-t border-border/60">
                        <td className="px-2 py-1">{v.sku}</td>
                        <td className="px-2 py-1">
                          {v.variantName ?? v.color ?? "Default"}
                        </td>
                        <td className="px-2 py-1">{v.size ?? "—"}</td>
                        <td className="px-2 py-1">
                          <input
                            type="number"
                            min={0}
                            className="w-20 px-2 py-1 border border-border rounded-md bg-background text-[11px]"
                            value={v.stock ?? 0}
                            onChange={(e) =>
                              updateVariantMutation.mutate({
                                id: v.id,
                                stock: Number.isNaN(parseInt(e.target.value, 10))
                                  ? 0
                                  : parseInt(e.target.value, 10),
                              })
                            }
                          />
                        </td>
                        <td className="px-2 py-1">
                          <label className="inline-flex items-center gap-1">
                            <input
                              type="checkbox"
                              className="w-3 h-3"
                              checked={v.isActive && (v.stock ?? 0) > 0}
                              onChange={(e) =>
                                updateVariantMutation.mutate({
                                  id: v.id,
                                  isActive: e.target.checked,
                                })
                              }
                            />
                            <span>
                              {v.isActive && (v.stock ?? 0) > 0 ? "In Stock" : "Disabled / Out"}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
