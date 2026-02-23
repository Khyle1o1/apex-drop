import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/lib/cart-store';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = getTotal();
  const shipping = total >= 75 ? 0 : 9.99;

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', state: '', zip: '', country: 'US',
    shippingMethod: 'standard',
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    navigate('/order/success');
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading font-extrabold text-3xl uppercase tracking-tight mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm uppercase tracking-wide mb-2">Contact</legend>
              <input
                type="email" required placeholder="Email address" value={form.email}
                onChange={e => update('email', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </fieldset>

            {/* Shipping Address */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm uppercase tracking-wide mb-2">Shipping Address</legend>
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="First name" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
                <input required placeholder="Last name" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
              <input required placeholder="Address" value={form.address} onChange={e => update('address', e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
              <div className="grid grid-cols-3 gap-4">
                <input required placeholder="City" value={form.city} onChange={e => update('city', e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
                <input required placeholder="State" value={form.state} onChange={e => update('state', e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
                <input required placeholder="ZIP" value={form.zip} onChange={e => update('zip', e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent" />
              </div>
            </fieldset>

            {/* Shipping Method */}
            <fieldset className="space-y-3">
              <legend className="font-heading font-bold text-sm uppercase tracking-wide mb-2">Shipping Method</legend>
              {[
                { id: 'standard', label: 'Standard (5-7 days)', price: total >= 75 ? 'Free' : '$9.99' },
                { id: 'express', label: 'Express (2-3 days)', price: '$14.99' },
              ].map(opt => (
                <label key={opt.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all
                  ${form.shippingMethod === opt.id ? 'border-accent bg-accent/5' : 'border-border hover:border-foreground/30'}
                `}>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="shipping" value={opt.id} checked={form.shippingMethod === opt.id}
                      onChange={e => update('shippingMethod', e.target.value)} className="accent-accent" />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                  <span className="text-sm font-semibold">{opt.price}</span>
                </label>
              ))}
            </fieldset>

            {/* Payment Placeholder */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm uppercase tracking-wide mb-2">Payment</legend>
              <div className="p-6 border border-border rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                Payment processing will be available in the full release. Your order will be simulated.
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground font-heading font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-secondary transition-all"
            >
              Place Order
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-card p-6 h-fit">
            <h2 className="font-heading font-bold text-lg uppercase tracking-wide mb-6">Order Summary</h2>
            <div className="space-y-3">
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId}-${item.size}`} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.product.title} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    ${((item.variant.priceOverride ?? item.product.basePrice) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>${(total + shipping).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
