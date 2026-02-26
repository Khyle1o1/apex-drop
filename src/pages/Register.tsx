import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/lib/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Register() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/shop';
  const reason = searchParams.get('reason');
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [form, setForm] = useState({
    fullName: '',
    idNumber: '',
    address: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'student' | 'alumni'>('student');

  const setField = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName.trim() || !form.idNumber.trim() || !form.address.trim() || !form.email.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    if (!form.password) {
      setError('Please choose a password.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        fullName: form.fullName,
        idNumber: form.idNumber,
        address: form.address,
        email: form.email,
        password: form.password,
        role,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success('Account created successfully');
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const loginLink = `/login?from=${encodeURIComponent(from)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-xl">
        <div className="mb-8">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight">
            Create Your Campus Store Account
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Registration is required before you can add items to your cart or place pickup orders.
          </p>
        </div>

        <div className="mb-4 inline-flex p-1 bg-muted border border-border rounded-pill text-xs font-semibold">
          <button
            type="button"
            onClick={() => setRole('student')}
            className={`px-4 py-2 rounded-pill transition-colors ${
              role === 'student' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('alumni')}
            className={`px-4 py-2 rounded-pill transition-colors ${
              role === 'alumni' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
          >
            Alumni
          </button>
        </div>

        {reason === 'login_required' && (
          <div className="mb-4 rounded-lg border border-accent/40 bg-accent/5 px-4 py-3 text-xs text-foreground">
            Register or Log in to continue.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-muted/30 border border-border rounded-xl p-6 md:p-8 space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              required
              placeholder="First Middle Last"
              value={form.fullName}
              onChange={(e) => setField('fullName', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idNumber">ID Number</Label>
            <Input
              id="idNumber"
              required
              placeholder="e.g. 2023-12345"
              value={form.idNumber}
              onChange={(e) => setField('idNumber', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              required
              rows={3}
              placeholder="Full address (for records — store is pickup-only)"
              value={form.address}
              onChange={(e) => setField('address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@campus.edu.ph"
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setField('password', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => setField('confirmPassword', e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg bg-background border border-dashed border-border px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">
              Pickup Only — University Economic Enterprise Unit
            </p>
            <p>Payment is done at the University Cashier.</p>
            <p>Bring the official cashier receipt to claim your merch.</p>
          </div>

          <Button type="submit" className="w-full mt-2" size="lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            Already have an account?{' '}
            <Link to={loginLink} className="text-accent font-semibold hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}

