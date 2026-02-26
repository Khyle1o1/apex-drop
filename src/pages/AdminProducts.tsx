import { useMemo, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { products } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { useInventoryStore } from '@/lib/inventory-store';

export default function AdminProducts() {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id ?? '');

  const getSizesForProductVariant = useInventoryStore((s) => s.getSizesForProductVariant);
  const getAllSizesForProduct = useInventoryStore((s) => s.getAllSizesForProduct);
  const upsertSize = useInventoryStore((s) => s.upsertSize);
  const removeSize = useInventoryStore((s) => s.removeSize);
  const setQuantity = useInventoryStore((s) => s.setQuantity);
  const toggleActive = useInventoryStore((s) => s.toggleActive);
  const addStandardSizesForProduct = useInventoryStore((s) => s.addStandardSizesForProduct);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? products[0],
    [selectedProductId],
  );

  const [newSizeLabel, setNewSizeLabel] = useState('');
  const [newSizeQuantity, setNewSizeQuantity] = useState<number>(0);
  const [newSizeVariantId, setNewSizeVariantId] = useState<string>('');

  const handleAddSize = () => {
    if (!selectedProduct) return;
    const label = newSizeLabel.trim().toUpperCase();
    if (!label) {
      window.alert('Size label is required.');
      return;
    }
    if (!newSizeVariantId) {
      window.alert('Please choose a color variant for this size.');
      return;
    }
    const existingForProduct = getAllSizesForProduct(selectedProduct.id);
    if (existingForProduct.some((s) => s.sizeLabel.toUpperCase() === label)) {
      window.alert('Size label must be unique per product.');
      return;
    }
    if (newSizeQuantity < 0) {
      window.alert('Stock must be greater than or equal to 0.');
      return;
    }

    upsertSize({
      productId: selectedProduct.id,
      variantId: newSizeVariantId,
      sizeLabel: label,
      quantity: newSizeQuantity,
      isActive: newSizeQuantity > 0,
    });
    setNewSizeLabel('');
    setNewSizeQuantity(0);
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage the campus merch catalog and per-size stock (demo data)."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <tr
                  key={p.id}
                  className={`border-t border-border/80 align-top cursor-pointer ${
                    selectedProduct?.id === p.id ? 'bg-muted/40' : ''
                  }`}
                  onClick={() => setSelectedProductId(p.id)}
                >
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

        {selectedProduct && (
          <div className="border border-border rounded-xl bg-background p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-heading font-bold text-sm">Sizes &amp; Stock</h2>
                <p className="text-xs text-muted-foreground">
                  Manage per-size inventory for <span className="font-semibold">{selectedProduct.title}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => addStandardSizesForProduct(selectedProduct.id)}
                className="px-3 py-1.5 rounded-md border border-border text-[11px] font-semibold hover:border-accent hover:text-accent"
              >
                Add Standard Sizes (S–2XL)
              </button>
            </div>

            {selectedProduct.variants.length === 0 ? (
              <p className="text-xs text-muted-foreground">No variants for this product.</p>
            ) : (
              <div className="space-y-4">
                {selectedProduct.variants.map((variant) => {
                  const sizes = getSizesForProductVariant(selectedProduct.id, variant.variantId);
                  return (
                    <div
                      key={variant.variantId}
                      className="border border-border rounded-lg p-3 space-y-3 bg-muted/40"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-border"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                          <span>{variant.colorName}</span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="min-w-full text-[11px]">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="px-2 py-1 font-semibold">Size</th>
                              <th className="px-2 py-1 font-semibold">Stock</th>
                              <th className="px-2 py-1 font-semibold">Enabled</th>
                              <th className="px-2 py-1 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sizes.map((s) => (
                              <tr key={s.id} className="border-t border-border/60">
                                <td className="px-2 py-1 font-semibold">{s.sizeLabel}</td>
                                <td className="px-2 py-1">
                                  <input
                                    type="number"
                                    min={0}
                                    className="w-20 px-2 py-1 border border-border rounded-md bg-background text-[11px]"
                                    value={s.quantity}
                                    onChange={(e) =>
                                      setQuantity(
                                        s.id,
                                        Number.isNaN(parseInt(e.target.value, 10))
                                          ? 0
                                          : parseInt(e.target.value, 10),
                                      )
                                    }
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <label className="inline-flex items-center gap-1">
                                    <input
                                      type="checkbox"
                                      checked={s.isActive && s.quantity > 0}
                                      onChange={(e) => toggleActive(s.id, e.target.checked)}
                                      className="w-3 h-3"
                                    />
                                    <span>{s.quantity === 0 ? 'Out of Stock' : 'Enabled'}</span>
                                  </label>
                                </td>
                                <td className="px-2 py-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          `Remove size ${s.sizeLabel} for ${variant.colorName}?`,
                                        )
                                      ) {
                                        removeSize(s.id);
                                      }
                                    }}
                                    className="text-destructive hover:underline"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {sizes.length === 0 && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="px-2 py-3 text-[11px] text-muted-foreground text-center"
                                >
                                  No sizes defined yet for this color.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedProduct.variants.length > 0 && (
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[11px] font-semibold">Add Size</p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    className="px-2 py-1 border border-border rounded-md text-[11px] bg-background"
                    value={newSizeVariantId}
                    onChange={(e) => setNewSizeVariantId(e.target.value)}
                  >
                    <option value="">Select color</option>
                    {selectedProduct.variants.map((v) => (
                      <option key={v.variantId} value={v.variantId}>
                        {v.colorName}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Size (e.g. S, M, L)"
                    className="px-2 py-1 border border-border rounded-md text-[11px] bg-background w-28"
                    value={newSizeLabel}
                    onChange={(e) => setNewSizeLabel(e.target.value)}
                  />
                  <input
                    type="number"
                    min={0}
                    className="px-2 py-1 border border-border rounded-md text-[11px] bg-background w-24"
                    value={Number.isNaN(newSizeQuantity) ? '' : newSizeQuantity}
                    onChange={(e) =>
                      setNewSizeQuantity(
                        Number.isNaN(parseInt(e.target.value, 10))
                          ? 0
                          : parseInt(e.target.value, 10),
                      )
                    }
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-secondary"
                  >
                    + Add Size
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Size labels must be unique per product. Stock 0 will automatically be treated as
                  out of stock.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
