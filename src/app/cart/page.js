'use client';
import { useCart } from '@/components/store/CartContext';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalCount, settings, currencySymbol, formatPrice } = useCart();
  const router = useRouter();

  const freeThreshold = settings?.freeShippingThreshold || 2000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your selected garments, sizes, and quantities before WhatsApp order placement.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Your bag is empty</h3>
            <p className="text-xs text-slate-500">
              Browse our handcrafted traditional & contemporary collections to pick your favourite styles.
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-md transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free delivery tracker */}
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} />
                    <span>
                      {isFreeDelivery
                        ? 'Congratulations! You qualify for FREE Nationwide Delivery.'
                        : `Add ${formatPrice(freeThreshold - subtotal)} more to unlock FREE Nationwide Delivery!`}
                    </span>
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-emerald-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 overflow-hidden">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-100 border shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="font-extrabold text-slate-900 text-sm hover:text-emerald-700 line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-slate-500">
                        Colour: <strong className="text-slate-700">{item.colour}</strong> | Size:{' '}
                        <strong className="text-slate-700">{item.size}</strong>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400">SKU: {item.sku}</p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-slate-900">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <Link
                  href="/shop"
                  className="font-bold text-emerald-700 hover:underline"
                >
                  &larr; Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-slate-400 hover:text-rose-600 font-medium"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({totalCount} items):</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-slate-900">
                    {isFreeDelivery
                      ? 'FREE'
                      : `${formatPrice(settings?.shippingCharge || 100)} (Inside) / ${formatPrice((settings?.shippingCharge || 100) + 50)} (Outside)`}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                  <span>Subtotal Amount:</span>
                  <span className="text-emerald-700">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to WhatsApp Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                  <span>Secure checkout with live stock verification.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-emerald-600 shrink-0" />
                  <span>Express delivery & Cash on Delivery available across India.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
