'use client';
import { useState } from 'react';
import { useCart } from '@/components/store/CartContext';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Truck,
  MessageSquare,
  ShieldCheck,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, subtotal, totalCount, clearCart } = useCart();
  const router = useRouter();

  // Delivery Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Processing state
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Shipping calculation
  const freeThreshold = 2000;
  const isFreeShipping = subtotal >= freeThreshold;
  const baseShipping = city.toLowerCase() === 'dhaka' ? 100 : 150;
  const shippingCharge = isFreeShipping ? 0 : baseShipping;
  const grandTotal = subtotal + shippingCharge;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add items before placing order.');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your WhatsApp / mobile phone number.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setErrorMessage('Please enter your full delivery address.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryAddress: deliveryAddress.trim(),
        city: city.trim(),
        postalCode: postalCode.trim() || null,
        notes: notes.trim() || null,
        items: cart.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          variantId: item.variantId,
          colour: item.colour,
          size: item.size,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process order.');
      }

      // Clear the client-side cart
      clearCart();

      // Launch WhatsApp direct order window
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank');
      }

      // Redirect customer to order success confirmation page
      router.push(`/order-success/${data.order.orderNumber}?wa=${encodeURIComponent(data.whatsappUrl || '')}`);
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred during order submission.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout Details</h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in your delivery address to generate your official order record and connect with our WhatsApp sales concierge.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-2xl flex items-center gap-2.5 animate-shake">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 max-w-md mx-auto my-8">
            <h3 className="font-bold text-slate-800 text-base">Your shopping bag is empty</h3>
            <p className="text-xs text-slate-400">Please choose items before checkout.</p>
            <Link
              href="/shop"
              className="inline-block px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Back to Catalog
            </Link>
          </div>
        ) : (
          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Delivery Form Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Truck size={18} className="text-emerald-600" />
                  <span>1. Delivery & Contact Details</span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mohammad Tanvir Hasan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      WhatsApp / Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 01711223344 or +8801711223344"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Our representative will send confirmation and parcel tracking to this WhatsApp number.
                    </p>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">
                      Street Address & Apartment Details <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      placeholder="House #, Road #, Sector / Area, Landmark..."
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">
                      City / District <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                    >
                      <option value="Dhaka">Dhaka City (Inside - ৳100)</option>
                      <option value="Chittagong">Chittagong (Nationwide - ৳150)</option>
                      <option value="Sylhet">Sylhet (Nationwide - ৳150)</option>
                      <option value="Rajshahi">Rajshahi (Nationwide - ৳150)</option>
                      <option value="Khulna">Khulna (Nationwide - ৳150)</option>
                      <option value="Barisal">Barisal (Nationwide - ৳150)</option>
                      <option value="Rangpur">Rangpur (Nationwide - ৳150)</option>
                      <option value="Mymensingh">Mymensingh (Nationwide - ৳150)</option>
                      <option value="Other District">Other District (Nationwide - ৳150)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Postal Code (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. 1213"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="font-bold text-slate-700">Special Order Instructions (Optional)</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Gift wrapping requested, deliver after 4 PM, call before arrival..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary & Place Button Column */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs text-slate-400 font-semibold">{totalCount} item(s)</span>
              </h3>

              {/* Items mini list */}
              <div className="max-h-56 overflow-y-auto space-y-2.5 divide-y divide-slate-100 pr-1 scrollbar-thin text-xs">
                {cart.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 overflow-hidden border shrink-0">
                        {item.productImage && (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate max-w-[150px]">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {item.colour} &bull; {item.size} &bull; Qty {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Financial Breakdown */}
              <div className="border-t border-slate-200 pt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-slate-900">
                    {isFreeShipping ? (
                      <span className="text-emerald-700 uppercase font-black">Free (Over ৳2000)</span>
                    ) : (
                      formatPrice(shippingCharge)
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between text-base font-black text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {/* WhatsApp Checkout Primary Action */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-black text-sm rounded-2xl shadow-xl shadow-green-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Stock & Creating Order...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare size={18} />
                    <span>Confirm Order via WhatsApp</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <p className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  <span>Real database order created with unique tracking ID.</span>
                </p>
                <p className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                  <span>Cash on Delivery upon parcel handover.</span>
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <StoreFooter />
    </div>
  );
}
