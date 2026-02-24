import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';

export default function Checkout() {
  const { items, getTotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const total = getTotal();
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    address: '', city: '', province: '', zip: '', country: 'PH',
    shippingMethod: 'standard',
  });

  const shippingCost = form.shippingMethod === 'express' ? 250 : (total >= 999 ? 0 : 150);

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

  const inputClass = "w-full px-4 py-3 border border-border rounded-lg text-sm bg-background focus:outline-none focus:ring-2 focus:ring-accent min-h-[44px]";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm mb-2">Contact</legend>
              <input
                type="email" required placeholder="Email address" value={form.email}
                onChange={e => update('email', e.target.value)} className={inputClass}
              />
            </fieldset>

            {/* Shipping Address */}
            <fieldset className="space-y-4">
              <legend className="font-heading font-bold text-sm mb-2">Shipping Address</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="First name" value={form.firstName} onChange={e => update('firstName', e.target.value)} className={inputClass} />
                <input required placeholder="Last name" value={form.lastName} onChange={e => update('lastName', e.target.value)} className={inputClass} />
              </div>
              <input required placeholder="Address" value={form.address} onChange={e => update('address', e.target.value)} className={inputClass} />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input required placeholder="City" value={form.city} onChange={e => update('city', e.target.value)} className={inputClass} />
                <input required placeholder="Province" value={form.province} onChange={e => update('province', e.target.value)} className={inputClass} />
                <input required placeholder="ZIP Code" value={form.zip} onChange={e => update('zip', e.target.value)} className={inputClass} />
              </div>
            </fieldset>

            {/* Shipping Method */}
            <fieldset className="space-y-3">
              <legend className="font-heading font-bold text-sm mb-2">Shipping Method</legend>
              {[
                { id: 'standard', label: 'Standard (3–5 days)', price: total >= 999 ? 'Free' : formatPrice(150) },
                { id: 'express', label: 'Express (1–2 days)', price: formatPrice(250) },
              ].map(opt => (
                <label key={opt.id} className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all min-h-[52px]
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
              <legend className="font-heading font-bold text-sm mb-2">Payment</legend>
              <div className="p-6 border border-border rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                Payment processing will be available in the full release. Your order will be simulated.
              </div>
            </fieldset>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all min-h-[48px]"
            >
              Place Order
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 h-fit lg:sticky lg:top-28 order-first lg:order-last">
            <button
              className="flex items-center justify-between w-full lg:cursor-default"
              onClick={() => setSummaryOpen(!summaryOpen)}
              type="button"
            >
              <h2 className="font-heading font-bold text-lg">Order Summary</h2>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${summaryOpen ? 'block' : 'hidden lg:block'} mt-4`}>
              <div className="space-y-3">
                {items.map(item => (
                  <div key={`${item.productId}-${item.variantId}-${item.size}`} className="flex justify-between text-sm">
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.title} × {item.quantity}
                    </span>
                    <span className="font-semibold whitespace-nowrap">
                      {formatPrice((item.variant.priceOverride ?? item.product.basePrice) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total + shippingCost)}</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
}
