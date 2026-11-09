'use client';
import { useCart } from '@/components/store/CartContext';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Truck, ShieldCheck, Crown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, totalCount, settings, currencySymbol } = useCart();
  const router = useRouter();

  const freeThreshold = settings?.freeShippingThreshold || 2000;
  const isFreeDelivery = subtotal >= freeThreshold;
  const progressPercent = Math.min(100, Math.round((subtotal / freeThreshold) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Crown size={12} className="text-amber-400" />
            <span>AR Fashion House &bull; Royal Bag</span>
          </div>
          <h1 className="font-royal-title text-3xl font-black text-white tracking-tight">Shopping Bag</h1>
          <p className="text-xs text-stone-400 mt-1">
            Review your selected garments, sizes, and quantities before WhatsApp order placement.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 p-12 text-center space-y-4 max-w-xl mx-auto my-8 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-royal-title font-bold text-white text-lg">Your bag is empty</h3>
            <p className="text-xs text-stone-400">
              Browse our handcrafted traditional & contemporary collections to pick your favourite styles.
            </p>
            <Link
              href="/shop"
              className="inline-flex px-6 py-3 gold-gradient-btn text-black font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items Column */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free delivery tracker */}
              <div className="bg-[#121218] border border-amber-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <Truck size={15} className="text-amber-400" />
                    <span>
                      {isFreeDelivery
                        ? 'Congratulations! You qualify for FREE Nationwide Delivery.'
                        : `Add ${formatPrice(freeThreshold - subtotal, currencySymbol)} more to unlock FREE Nationwide Delivery!`}
                    </span>
                  </span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 shadow-xl divide-y divide-white/5 overflow-hidden">
                {cart.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex gap-4 items-center">
                    <div className="w-20 h-24 rounded-2xl overflow-hidden bg-stone-900 border border-amber-500/20 shrink-0">
                      {item.productImage ? (
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500">
                          No Photo
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <Link
                        href={`/product/${item.productId}`}
                        className="font-bold text-stone-100 text-sm hover:text-amber-300 line-clamp-1 transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-xs text-stone-400">
                        Colour: <strong className="text-amber-300">{item.colour}</strong> | Size:{' '}
                        <strong className="text-amber-300">{item.size}</strong>
                      </p>
                      <p className="text-[11px] font-mono text-stone-500">SKU: {item.sku}</p>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        {/* Stepper */}
                        <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-[#181822]">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-2 text-stone-300 hover:bg-white/10 disabled:opacity-30"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-amber-300 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.maxStock}
                            className="p-2 text-stone-300 hover:bg-white/10 disabled:opacity-30"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="text-base font-black text-amber-400 font-serif-luxury">
                            {formatPrice(item.unitPrice * item.quantity, currencySymbol)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-400 rounded-lg transition-colors"
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
                  className="font-bold text-amber-400 hover:underline uppercase tracking-wider"
                >
                  &larr; Continue Shopping
                </Link>
                <button
                  onClick={clearCart}
                  className="text-stone-500 hover:text-rose-400 font-medium transition-colors"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 p-6 shadow-xl space-y-5">
              <h3 className="font-royal-title font-bold text-white text-base border-b border-white/5 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-stone-400">
                <div className="flex justify-between">
                  <span>Bag Subtotal ({totalCount} items):</span>
                  <span className="font-bold text-stone-200">{formatPrice(subtotal, currencySymbol)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span className="font-bold text-amber-400">
                    {isFreeDelivery
                      ? 'FREE'
                      : `${formatPrice(settings?.shippingCharge || 100, currencySymbol)}`}
                  </span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between text-base font-black text-white">
                  <span>Subtotal Amount:</span>
                  <span className="text-amber-400 font-serif-luxury text-lg">{formatPrice(subtotal, currencySymbol)}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/checkout')}
                className="w-full py-4 gold-gradient-btn text-black font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <span>Proceed to WhatsApp Checkout</span>
                <ArrowRight size={16} />
              </button>

              <div className="pt-2 text-[11px] text-stone-500 space-y-1.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-amber-400 shrink-0" />
                  <span>Secure checkout with live inventory verification.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-amber-400 shrink-0" />
                  <span>Express delivery & COD available across India.</span>
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
