'use client';
import { useCart } from './CartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Portal from '@/components/ui/Portal';

export default function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, updateQuantity, removeFromCart, subtotal, totalCount } =
    useCart();
  const router = useRouter();

  if (!drawerOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] bg-slate-950/60 backdrop-blur-xs flex justify-end">
        <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag size={18} className="text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">
                Shopping Cart ({totalCount})
              </h3>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag size={28} />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">Your shopping bag is empty</h4>
                <p className="text-xs text-slate-400 max-w-xs">
                  Discover our exclusive Panjabis, Sarees, and festive collections.
                </p>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/shop');
                  }}
                  className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-colors"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl border border-slate-200/90 bg-white flex gap-3 shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border shrink-0">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                        No Img
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate leading-snug">
                      {item.productName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.colour} &bull; Size {item.size}
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      {formatPrice(item.unitPrice)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-xs"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 text-xs"
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
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
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Estimated Subtotal:</span>
                <span className="text-base font-black text-slate-900">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Delivery fees calculated during WhatsApp checkout confirmation.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/cart');
                  }}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs hover:bg-white transition-colors"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    router.push('/checkout');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-1.5"
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
