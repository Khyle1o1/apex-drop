import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/lib/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const updateCurrentUser = useAuthStore((s) => s.updateCurrentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login?from=/profile', { replace: true });
    }
  }, [user, navigate]);

  const [form, setForm] = useState({
    fullName: '',
    address: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName,
      address: user.address,
    });
  }, [user]);

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (!user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateCurrentUser({
      fullName: form.fullName.trim(),
      address: form.address.trim(),
    });
    toast.success('Account details updated');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-2xl">
        <div className="mb-8">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight">
            My Account
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Update the information that will appear on your pickup orders.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-muted/30 border border-border rounded-xl p-6 md:p-8 space-y-5"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                required
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ID Number</Label>
              <Input value={user.idNumber} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email} disabled className="bg-muted" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="Full address used for your records — store is pickup-only."
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </div>

          <div className="rounded-lg bg-background border border-dashed border-border px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">
              Pickup Only — University Economic Enterprise Unit
            </p>
            <p>Payment is done at the University Cashier.</p>
            <p>Bring the official cashier receipt to claim your merch.</p>
          </div>

          <Button type="submit" className="w-full mt-2" size="lg">
            Save and Continue
          </Button>
        </form>
      </div>
    </Layout>
  );
}

