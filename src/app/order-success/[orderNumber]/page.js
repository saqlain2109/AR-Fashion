import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CheckCircle,
  ShoppingBag,
  MessageSquare,
  Truck,
  ArrowRight,
  Phone,
  Crown,
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function OrderSuccessPage({ params, searchParams }) {
  const { orderNumber } = params;
  const waUrl = searchParams?.wa;

  const [settings, order] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    }),
  ]);

  if (!order) {
    notFound();
  }

  const currencySymbol = settings?.currencySymbol || '₹';
  const cleanPhone = (settings?.primaryPhone || '+917304396709').replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader settings={settings} />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 p-8 sm:p-10 shadow-2xl space-y-8 text-center">
          {/* Success Checkmark */}
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Crown size={32} />
          </div>

          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 inline-flex items-center gap-1.5">
              <span>Order Recorded in Atelier</span>
            </span>
            <h1 className="font-royal-title text-2xl sm:text-3xl font-black text-white tracking-tight mt-3">
              Thank You for Your Order!
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1">
              Your royal order tracking number is{' '}
              <strong className="text-amber-400 font-mono text-sm">{order.orderNumber}</strong>
            </p>
          </div>

          {/* WhatsApp Direct Action Banner */}
          <div className="bg-[#102418] border border-emerald-500/30 rounded-2xl p-6 space-y-3 text-left">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-md">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-white text-sm">
                  Connect on WhatsApp to Dispatch Your Order
                </h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Click the button below to send your pre-formatted order summary to our boutique concierge.
                </p>
              </div>
            </div>

            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] uppercase tracking-wider"
              >
                <span>Send Order Summary on WhatsApp</span>
                <ArrowRight size={15} />
              </a>
            )}
          </div>

          {/* Order Snapshot */}
          <div className="bg-[#121218] rounded-2xl p-5 border border-white/5 text-left text-xs space-y-3">
            <h4 className="font-royal-title font-bold text-stone-200 uppercase tracking-wider text-[11px] border-b border-white/5 pb-2">
              Order Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-stone-400">
              <div>
                <span>Recipient:</span>{' '}
                <strong className="text-stone-200">{order.customerName}</strong>
              </div>
              <div>
                <span>Phone:</span>{' '}
                <strong className="text-stone-200">{order.customerPhone}</strong>
              </div>
              <div className="col-span-2">
                <span>Address:</span>{' '}
                <strong className="text-stone-200">{order.deliveryAddress}</strong>
              </div>
              <div>
                <span>Date:</span>{' '}
                <strong className="text-stone-200">{formatDate(order.createdAt)}</strong>
              </div>
              <div>
                <span>Total Amount:</span>{' '}
                <strong className="text-amber-400 font-bold text-sm">
                  {formatPrice(order.totalAmount, currencySymbol)}
                </strong>
              </div>
            </div>
          </div>

          {/* Return to shop */}
          <div className="pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 gold-gradient-btn text-black font-black text-xs rounded-xl shadow-md uppercase tracking-wider transition-colors"
            >
              <ShoppingBag size={15} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
