import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useAuthStore } from '@/lib/auth-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from') || '/shop';
  const reason = searchParams.get('reason');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your Email or ID Number');
      return;
    }

    const result = login({ identifier, password });

    if (!result.ok) {
      if (result.error === 'missing_identifier') {
        setError('Please enter your Email or ID Number');
      } else if (result.error === 'account_not_found') {
        setError('Account not found');
      } else if (result.error === 'incorrect_password') {
        setError('Incorrect password');
      }
      return;
    }

    const { user } = useAuthStore.getState();

    if (user?.isAdmin) {
      navigate('/admin/dashboard', { replace: true });
      return;
    }

    navigate(from || '/shop', { replace: true });
  };

  const registerLink = `/register?from=${encodeURIComponent(from)}${reason ? `&reason=${encodeURIComponent(reason)}` : ''}`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 md:py-16 max-w-xl">
        <div className="mb-8">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight">
            Campus Store Login
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Login is required to access your cart and place pickup orders.
          </p>
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
            <Label htmlFor="identifier">Email or ID Number</Label>
            <Input
              id="identifier"
              required
              placeholder="you@campus.edu.ph or 2023-12345"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            Log In
          </Button>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            New here?{' '}
            <Link to={registerLink} className="text-accent font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </Layout>
  );
}

