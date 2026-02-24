import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/format';
import ProductImage from '@/components/product/ProductImage';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const freeShippingThreshold = 999;
  const shipping = total >= freeShippingThreshold ? 0 : 150;
  const [summaryOpen, setSummaryOpen] = useState(true);

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-4">Your Cart is Empty</h1>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything yet.</p>
          <Link
            to="/shop"
            className="inline-flex px-8 py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl tracking-tight mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const price = item.variant.priceOverride ?? item.product.basePrice;
              return (
                <div key={`${item.productId}-${item.variantId}-${item.size}`} className="flex gap-4 p-4 border border-border rounded-xl">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <ProductImage product={item.product} variant={item.variant} className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product.slug}?variant=${item.variantId}`} className="font-heading font-bold text-sm hover:text-accent transition-colors">
                      {item.product.title}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.variant.colorName}{item.size ? ` / ${item.size}` : ''}
                    </p>
                    <p className="font-semibold text-sm mt-1">{formatPrice(price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => removeItem(item.productId, item.variantId, item.size)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 border border-border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.size, item.quantity - 1)}
                        className="p-2.5 hover:bg-muted transition-colors rounded-l-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.variantId, item.size, item.quantity + 1)}
                        className="p-2.5 hover:bg-muted transition-colors rounded-r-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 h-fit lg:sticky lg:top-28">
            <button
              className="flex items-center justify-between w-full lg:cursor-default"
              onClick={() => setSummaryOpen(!summaryOpen)}
            >
              <h2 className="font-heading font-bold text-lg">Order Summary</h2>
              <ChevronDown className={`w-4 h-4 lg:hidden transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`${summaryOpen ? 'block' : 'hidden lg:block'} mt-4`}>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-lg">{formatPrice(total + shipping)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                className="block text-center mt-6 w-full py-3.5 bg-primary text-primary-foreground font-heading font-bold text-sm tracking-wider rounded-lg hover:bg-secondary transition-all"
              >
                Proceed to Checkout
              </Link>
              {total < freeShippingThreshold && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Add {formatPrice(freeShippingThreshold - total)} more for free shipping
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
