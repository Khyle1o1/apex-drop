import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Trash2, Tags } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryRow {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);

  const { data: categories = [], isLoading } = useQuery<CategoryRow[]>({
    queryKey: ['admin-categories'],
    queryFn: () => apiJson<CategoryRow[]>('/api/admin/categories'),
  });

  const createMut = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiJson<CategoryRow>('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category created');
      setNewName('');
      setNewDesc('');
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to create category'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) =>
      apiJson<void>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
      setDeleteTarget(null);
    },
    onError: (e: Error) => toast.error(e.message || 'Failed to delete category'),
  });

  const handleCreate = () => {
    if (!newName.trim()) { toast.error('Category name is required'); return; }
    createMut.mutate({ name: newName.trim(), description: newDesc.trim() || undefined });
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Manage product categories. Select a category when adding products."
    >
      {/* Add form */}
      <div className="w-full max-w-xl rounded-xl border border-border bg-background p-4 space-y-3">
        <h3 className="text-sm font-semibold">Add New Category</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="cat-name" className="text-xs">Category Name *</Label>
            <Input
              id="cat-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Hoodies"
              className="h-8 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="cat-desc" className="text-xs">Description (optional)</Label>
            <Input
              id="cat-desc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Brief description"
              className="h-8 text-sm"
            />
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          disabled={createMut.isPending}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          {createMut.isPending ? 'Adding…' : 'Add Category'}
        </Button>
      </div>

      {/* Category list */}
      <div className="w-full max-w-xl rounded-xl border border-border bg-background p-4">
        <h3 className="text-sm font-semibold mb-3">
          Existing Categories ({categories.length})
        </h3>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <Tags className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No categories yet. Add one above.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between border border-border rounded-lg px-3 py-2"
              >
                <div>
                  <span className="text-sm font-semibold">{cat.name}</span>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(cat)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-3 text-[11px] text-muted-foreground">
          Categories are selected inside the Add/Edit Product form in the{' '}
          <a href="/admin/products" className="underline hover:text-foreground">
            Products
          </a>{' '}
          page.
        </p>
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{deleteTarget?.name}</strong>? Products in this category will have their
              category cleared but will not be deleted.
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
