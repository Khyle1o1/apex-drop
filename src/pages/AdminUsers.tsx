import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuthStore } from '@/lib/auth-store';

export default function AdminUsers() {
  const users = useAuthStore((s) => s.users);
  const setUserDisabled = useAuthStore((s) => s.setUserDisabled);

  const customerUsers = users.filter((u) => !u.isAdmin);

  return (
    <AdminLayout
      title="Users"
      subtitle="View registered customers, their status, and order access."
    >
      <div className="border border-border rounded-xl bg-background p-4 md:p-6">
        {customerUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">No customer accounts registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs md:text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left">
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Name</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Email</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">ID Number</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Created</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap">Status</th>
                  <th className="px-4 py-2 font-semibold whitespace-nowrap text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {customerUsers.map((u) => (
                  <tr key={u.id} className="border-t border-border/80">
                    <td className="px-4 py-2 whitespace-nowrap">{u.fullName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">{u.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-xs">{u.idNumber}</td>
                    <td className="px-4 py-2 text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${
                          u.isDisabled
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-emerald-500/10 text-emerald-600'
                        }`}
                      >
                        {u.isDisabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setUserDisabled(u.id, !u.isDisabled)}
                        className="inline-flex items-center rounded-md border border-border px-2.5 py-1 text-[11px] font-semibold hover:border-accent hover:text-accent transition-colors"
                      >
                        {u.isDisabled ? 'Enable Account' : 'Disable Account'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

