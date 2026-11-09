'use client';
import { useCart } from './CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Crown } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Portal from '@/components/ui/Portal';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, subtotal, totalCount, currencySymbol } =
    useCart();
  const router = useRouter();

  if (!drawerOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xs flex justify-end">
        <div className="bg-[#0C0C12] text-stone-100 w-full max-w-md h-full shadow-2xl border-l border-amber-500/30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between bg-[#07070A]">
            <div className="flex items-center gap-2.5">
              <Crown size={18} className="text-amber-400" />
              <h3 className="font-royal-title font-black text-white text-sm">
                Shopping Bag ({totalCount})
              </h3>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-royal-title font-bold text-white text-base">Your bag is empty</h4>
                <p className="text-xs text-stone-400 max-w-xs">
                  Discover our exclusive Panjabis, Sarees, and festive collections.
                </p>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/shop');
                  }}
                  className="px-5 py-2.5 gold-gradient-btn text-black font-black text-xs rounded-xl shadow-md uppercase tracking-wider cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-amber-500/20 bg-[#121218] flex gap-3 shadow-md"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-900 border border-amber-500/20 shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-500">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-100 text-xs truncate leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-amber-300/80 mt-0.5">
                      {item.colour} &bull; Size {item.size}
                    </p>
                    <p className="text-xs font-black text-amber-400 mt-1 font-serif-luxury">
                      {formatPrice(item.unitPrice, currencySymbol)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden bg-[#181822]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-0.5 text-stone-300 hover:bg-white/10 disabled:opacity-30 text-xs"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-amber-300 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2 py-0.5 text-stone-300 hover:bg-white/10 disabled:opacity-30 text-xs"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-400 transition-colors"
                        title="Remove"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-amber-500/20 bg-[#07070A] space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 font-medium">Estimated Subtotal:</span>
                <span className="text-base sm:text-lg font-black text-amber-400 font-serif-luxury">
                  {formatPrice(subtotal, currencySymbol)}
                </span>
              </div>
              <p className="text-[10px] text-stone-500">
                Delivery fees calculated during WhatsApp checkout confirmation.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/cart');
                  }}
                  className="w-full py-2.5 border border-amber-500/30 text-stone-200 hover:text-white hover:bg-white/5 font-bold rounded-xl text-xs transition-colors uppercase tracking-wider"
                >
                  View Bag
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/checkout');
                  }}
                  className="w-full py-2.5 gold-gradient-btn text-black font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                >
                  <span>Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
