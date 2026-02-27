import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiJson } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, X, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface ProductRow {
  id: string;
  name: string;
  basePrice: string;
  images: string[];
  isActive: boolean;
  categoryId: string | null;
  categoryName: string | null;
  variantCount: number;
}

interface SizeEntry {
  id?: string;
  size: string;
  isActive: boolean;
}

interface VariantEntry {
  id?: string;
  name: string;
  priceOverride: string;
  colorHex: string;
  imageUrl: string;
  isActive: boolean;
  sizes: SizeEntry[];
}

interface ProductFormState {
  name: string;
  categoryId: string;
  basePrice: string;
  imageUrl: string;
  colorHex: string;
  description: string;
  isActive: boolean;
  defaultSizes: SizeEntry[];
  variants: VariantEntry[];
}

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

const emptyVariant = (): VariantEntry => ({
  name: '',
  priceOverride: '',
  colorHex: '#0B1026',
  imageUrl: '',
  isActive: true,
  sizes: [{ size: 'S', isActive: true }],
});

const emptyForm = (): ProductFormState => ({
  name: '',
  categoryId: '',
  basePrice: '',
  imageUrl: '',
  colorHex: '#0B1026',
  description: '',
  isActive: true,
  defaultSizes: [{ size: 'Standard', isActive: true }],
  variants: [],
});

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(form: ProductFormState): string | null {
  if (!form.name.trim()) return 'Product name is required.';
  if (!form.categoryId) return 'Please select a category.';
  if (!form.basePrice || isNaN(Number(form.basePrice)) || Number(form.basePrice) < 0)
    return 'A valid base price is required.';
  if (form.defaultSizes.length === 0) return 'Main product must have at least one default size.';
  for (const s of form.defaultSizes) {
    if (!s.size.trim()) return 'Default size value cannot be empty.';
  }
  const defaultSizeVals = form.defaultSizes.map((s) => s.size.trim());
  if (new Set(defaultSizeVals).size !== defaultSizeVals.length)
    return 'Duplicate default sizes are not allowed.';
  for (let i = 0; i < form.variants.length; i++) {
    const v = form.variants[i];
    if (!v.name.trim()) return `Variant ${i + 1}: name is required.`;
    if (v.priceOverride && (isNaN(Number(v.priceOverride)) || Number(v.priceOverride) < 0))
      return `Variant ${i + 1}: invalid price override.`;
    if (v.sizes.length === 0) return `Variant "${v.name}": at least one size is required.`;
    const sizeVals = v.sizes.map((s) => s.size.trim());
    if (new Set(sizeVals).size !== sizeVals.length)
      return `Variant "${v.name}": duplicate sizes are not allowed.`;
    for (const s of v.sizes) {
      if (!s.size.trim()) return `Variant "${v.name}": size value cannot be empty.`;
    }
  }
  return null;
}

function formToPayload(form: ProductFormState) {
  return {
    name: form.name.trim(),
    categoryId: form.categoryId,
    basePrice: form.basePrice,
    images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
    colorHex: form.colorHex.trim() || null,
    description: form.description.trim() || null,
    isActive: form.isActive,
    defaultSizes: form.defaultSizes.map((s) => ({
      id: s.id,
      size: s.size.trim(),
      isActive: s.isActive,
    })),
    variants: form.variants.map((v) => ({
      id: v.id,
      name: v.name.trim(),
      colorHex: v.colorHex.trim() || null,
      imageUrl: v.imageUrl.trim() || null,
      priceOverride: v.priceOverride.trim() || null,
      isActive: v.isActive,
      sizes: v.sizes.map((s) => ({
        id: s.id,
        size: s.size.trim(),
        isActive: s.isActive,
      })),
    })),
  };
}

// ─── Variant Form Row ─────────────────────────────────────────────────────────

interface VariantRowProps {
  variant: VariantEntry;
  index: number;
  onChange: (v: VariantEntry) => void;
  onRemove: () => void;
  canRemove: boolean;
}

function VariantRow({ variant, index, onChange, onRemove, canRemove }: VariantRowProps) {
  const [expanded, setExpanded] = useState(true);

  const updateSize = (si: number, updated: Partial<SizeEntry>) => {
    const newSizes = variant.sizes.map((s, idx) => (idx === si ? { ...s, ...updated } : s));
    onChange({ ...variant, sizes: newSizes });
  };

  const addSize = (preset?: string) => {
    onChange({
      ...variant,
      sizes: [...variant.sizes, { size: preset ?? '', isActive: true }],
    });
  };

  const removeSize = (si: number) => {
    onChange({ ...variant, sizes: variant.sizes.filter((_, idx) => idx !== si) });
  };

  return (
    <div className="rounded-lg border border-border bg-muted/20 overflow-hidden">
      {/* Variant header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-background border-b border-border">
        <button
          type="button"
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Variant {index + 1}
        </span>
        <span className="text-sm font-medium flex-1 truncate">{variant.name || '(unnamed)'}</span>
        <div className="flex items-center gap-1.5">
          <Switch
            checked={variant.isActive}
            onCheckedChange={(v) => onChange({ ...variant, isActive: v })}
            className="scale-90"
          />
          <span className="text-xs text-muted-foreground">{variant.isActive ? 'Active' : 'Inactive'}</span>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-1 shrink-0 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {expanded && (
        <div className="p-3 space-y-3">
          {/* Variant name + price */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Variant / Color Name *</Label>
              <Input
                value={variant.name}
                onChange={(e) => onChange({ ...variant, name: e.target.value })}
                placeholder="e.g. Navy, Black, Maroon"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Variant Price Override{' '}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                value={variant.priceOverride}
                onChange={(e) => onChange({ ...variant, priceOverride: e.target.value })}
                placeholder="Leave blank to use base price"
                type="number"
                min="0"
                step="0.01"
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Color swatch + variant image */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Color Swatch</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={variant.colorHex || '#0B1026'}
                  onChange={(e) => onChange({ ...variant, colorHex: e.target.value })}
                  className="h-8 w-10 rounded border border-border bg-transparent p-0"
                />
                <Input
                  value={variant.colorHex}
                  onChange={(e) => onChange({ ...variant, colorHex: e.target.value })}
                  placeholder="#0B1026"
                  className="h-8 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Variant Image <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                type="file"
                accept="image/*"
                className="h-8 text-xs"
                onChange={(e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const result = reader.result;
                    if (typeof result === 'string') {
                      onChange({ ...variant, imageUrl: result });
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              {variant.imageUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-muted/40">
                    <img
                      src={variant.imageUrl}
                      alt={variant.name || 'Variant'}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ ...variant, imageUrl: '' })}
                    className="text-[11px] text-muted-foreground hover:text-destructive"
                  >
                    Remove image
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <Label className="text-xs">Sizes Available *</Label>
              <div className="flex flex-wrap items-center gap-1">
                {DEFAULT_SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => addSize(sz)}
                    className="rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium hover:bg-muted"
                  >
                    +{sz}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addSize()}
                  className="rounded border border-border bg-background px-2 py-0.5 text-[11px] font-medium hover:bg-muted"
                >
                  + Custom
                </button>
              </div>
            </div>

            {variant.sizes.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No sizes added yet.</p>
            )}

            <div className="flex flex-wrap gap-2">
              {variant.sizes.map((s, si) => (
                <div
                  key={si}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-1"
                >
                  <Input
                    value={s.size}
                    onChange={(e) => updateSize(si, { size: e.target.value })}
                    className="h-6 w-16 text-xs border-0 p-0 focus-visible:ring-0"
                    placeholder="Size"
                  />
                  <Switch
                    checked={s.isActive}
                    onCheckedChange={(v) => updateSize(si, { isActive: v })}
                    className="scale-75"
                  />
                  <button
                    type="button"
                    onClick={() => removeSize(si)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Product Sheet ─────────────────────────────────────────────────────────────

interface ProductSheetProps {
  open: boolean;
  editProductId: string | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

function ProductSheet({ open, editProductId, categories, onClose, onSuccess }: ProductSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!editProductId;
  const [form, setForm] = useState<ProductFormState>(emptyForm());
  const [errors, setErrors] = useState<string | null>(null);

  // Load product details when editing
  const { data: editData, isLoading: isLoadingEdit } = useQuery({
    queryKey: ['admin-product-detail', editProductId],
    queryFn: () => apiJson<any>(`/api/admin/products/${editProductId}`),
    enabled: !!editProductId && open,
  });

  useEffect(() => {
    if (editData && isEditing) {
      setForm({
        name: editData.name ?? '',
        categoryId: editData.categoryId ?? '',
        basePrice: editData.basePrice ?? '',
        imageUrl: (editData.images?.[0] ?? ''),
        colorHex: editData.colorHex ?? '#0B1026',
        description: editData.description ?? '',
        isActive: editData.isActive ?? true,
        defaultSizes: (editData.defaultSizes ?? []).map((s: any) => ({
          id: s.id,
          size: s.size,
          isActive: s.isActive ?? true,
        })),
        variants: (editData.variants ?? []).map((v: any) => ({
          id: v.id,
          name: v.variantName ?? v.color ?? '',
          priceOverride: v.priceOverride ?? '',
          colorHex: v.colorHex ?? '',
          imageUrl: v.imageUrl ?? '',
          isActive: v.isActive ?? true,
          sizes: (v.sizes ?? []).map((s: any) => ({
            id: s.id,
            size: s.size,
            isActive: s.isActive ?? true,
          })),
        })),
      });
    } else if (!editProductId) {
      setForm(emptyForm());
      setErrors(null);
    }
  }, [editData, editProductId, isEditing]);

  const createMut = useMutation({
    mutationFn: (payload: object) =>
      apiJson<any>('/api/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product created successfully');
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create product'),
  });

  const updateMut = useMutation({
    mutationFn: (payload: object) =>
      apiJson<any>(`/api/admin/products/${editProductId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-product-detail', editProductId] });
      toast.success('Product updated successfully');
      onSuccess();
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to update product'),
  });

  const handleImageChange = (e: any) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        setForm((f) => ({ ...f, imageUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const err = validateForm(form);
    if (err) { setErrors(err); return; }
    setErrors(null);
    const payload = formToPayload(form);
    if (isEditing) updateMut.mutate(payload);
    else createMut.mutate(payload);
  };

  const isSaving = createMut.isPending || updateMut.isPending;

  const updateVariant = (idx: number, v: VariantEntry) => {
    setForm((f) => ({ ...f, variants: f.variants.map((vv, i) => (i === idx ? v : vv)) }));
  };

  const addVariant = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  };

  const removeVariant = (idx: number) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-heading text-lg font-bold">
            {isEditing ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isEditing
              ? 'Update product info, variants, and sizes. Stock is managed in Inventory.'
              : 'Create a new product with variants and sizes. Stock is set to 0 and managed in Inventory.'}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingEdit ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Loading product details…
          </div>
        ) : (
          <div className="px-6 py-5 space-y-6">
            {errors && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-2.5 text-sm text-destructive">
                {errors}
              </div>
            )}

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1.5">
                Product Details
              </h3>

              <div className="space-y-1">
                <Label htmlFor="prod-name" className="text-xs">Product Name *</Label>
                <Input
                  id="prod-name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Campus Classic Hoodie"
                  className="h-9"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="prod-category" className="text-xs">Category *</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                  >
                    <SelectTrigger id="prod-category" className="h-9 text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="prod-price" className="text-xs">Base Price *</Label>
                  <Input
                    id="prod-price"
                    value={form.basePrice}
                    onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
                    placeholder="0.00"
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-image" className="text-xs">Main Product Image</Label>
                <Input
                  id="prod-image"
                  type="file"
                  accept="image/*"
                  className="h-9 text-xs"
                  onChange={handleImageChange}
                />
                {form.imageUrl && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-12 w-12 rounded-md overflow-hidden border border-border bg-muted/40">
                      <img
                        src={form.imageUrl}
                        alt={form.name || 'Preview'}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.visibility = 'hidden';
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      This main product image is the default image shown before selecting other variants. Stock is managed in Inventory.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Main Product Color (Default Swatch)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.colorHex}
                    onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))}
                    className="h-9 w-14 rounded border border-border cursor-pointer bg-background"
                  />
                  <Input
                    value={form.colorHex}
                    onChange={(e) => setForm((f) => ({ ...f, colorHex: e.target.value }))}
                    placeholder="#0B1026"
                    className="h-9 font-mono text-sm max-w-[120px]"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  This is the default first swatch shown in the shop.
                </p>
              </div>

              <div className="space-y-1">
                <Label htmlFor="prod-desc" className="text-xs">
                  Description{' '}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="prod-desc"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Product description…"
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  id="prod-active"
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))}
                />
                <Label htmlFor="prod-active" className="text-sm cursor-pointer">
                  {form.isActive ? 'Active — visible in store' : 'Inactive — hidden from store'}
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Main Product Default Sizes</Label>
                <p className="text-[11px] text-muted-foreground">
                  Sizes for the main/default product option. Used when the first swatch is selected.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {form.defaultSizes.map((s, si) => (
                    <div key={si} className="flex items-center gap-1.5 border border-border rounded-lg px-2 py-1.5 bg-muted/20">
                      <Input
                        value={s.size}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            defaultSizes: f.defaultSizes.map((ss, i) =>
                              i === si ? { ...ss, size: e.target.value } : ss,
                            ),
                          }))
                        }
                        placeholder="Size"
                        className="h-7 w-20 text-xs"
                      />
                      <Switch
                        checked={s.isActive}
                        onCheckedChange={(v) =>
                          setForm((f) => ({
                            ...f,
                            defaultSizes: f.defaultSizes.map((ss, i) =>
                              i === si ? { ...ss, isActive: v } : ss,
                            ),
                          }))
                        }
                        className="scale-75"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            defaultSizes: f.defaultSizes.filter((_, i) => i !== si),
                          }))
                        }
                        disabled={form.defaultSizes.length <= 1}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-40"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        defaultSizes: [...f.defaultSizes, { size: '', isActive: true }],
                      }))
                    }
                    className="text-xs text-accent hover:underline"
                  >
                    + Add size
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Variants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-1.5">
                <h3 className="text-sm font-semibold text-foreground">Additional Variants / Colors</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVariant}
                  className="h-7 text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Variant / Color
                </Button>
              </div>

              <p className="text-xs text-muted-foreground -mt-1">
                The main product image and swatch are used as the first default option in the shop.
                <br />
                Additional variants appear after the main/default product swatch. Each can have its own price override.
                <br />
                Stock is <strong>not managed here</strong> — go to Inventory / Variants page to set stock.
              </p>

              <div className="space-y-3">
                {form.variants.map((v, idx) => (
                  <VariantRow
                    key={idx}
                    variant={v}
                    index={idx}
                    onChange={(updated) => updateVariant(idx, updated)}
                    onRemove={() => removeVariant(idx)}
                    canRemove={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="border-t border-border px-6 py-4 flex flex-row items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving} type="button">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving || isLoadingEdit} type="button">
            {isSaving ? 'Saving…' : isEditing ? 'Update Product' : 'Save Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);

  const { data: products = [], isLoading } = useQuery<ProductRow[]>({
    queryKey: ['admin-products'],
    queryFn: () => apiJson<ProductRow[]>('/api/admin/products'),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiJson<Category[]>('/api/admin/categories'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiJson<void>(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete product'),
  });

  const openAdd = () => {
    setEditProductId(null);
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    setEditProductId(id);
    setDialogOpen(true);
  };

  const closeSheet = () => {
    setDialogOpen(false);
    setEditProductId(null);
  };

  return (
    <AdminLayout
      title="Products"
      subtitle="Manage product catalog, variants, and sizes."
    >
      <div className="px-0 md:px-1 py-1 md:py-2 w-full min-w-0">
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 w-full mb-5 sm:mb-6">
          <p className="text-sm text-muted-foreground">
            {products.length} product{products.length !== 1 ? 's' : ''} in catalog
          </p>
          <Button onClick={openAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Products table */}
        <div className="w-full min-w-0 rounded-xl border border-border bg-background overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <PackageOpen className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No products yet. Add your first product.</p>
            <Button variant="outline" size="sm" onClick={openAdd} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-12">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Product Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Base Price
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Variants
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded-md overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <PackageOpen className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{p.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted-foreground text-xs">
                        {p.categoryName ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {formatPrice(Number(p.basePrice))}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                        {p.variantCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={p.isActive ? 'default' : 'secondary'}
                        className={
                          p.isActive
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-50'
                            : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-100'
                        }
                      >
                        {p.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(p.id)}
                          className="h-8 w-8 p-0"
                          title="Edit product"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(p)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          title="Delete product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* Add/Edit Sheet */}
      <ProductSheet
        open={dialogOpen}
        editProductId={editProductId}
        categories={categories}
        onClose={closeSheet}
        onSuccess={closeSheet}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong> along with all its
              variants, sizes, and inventory records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMut.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMut.mutate(deleteTarget.id)}
              disabled={deleteMut.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMut.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
