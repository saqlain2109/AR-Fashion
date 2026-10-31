import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function StoreFooter({ settings = null }) {
  const businessName = settings?.businessName || 'AR Fashion House';
  const primaryPhone = settings?.primaryPhone || '+8801700000000';
  const email = settings?.businessEmail || 'support@arfashionhouse.com';
  const address = settings?.address || 'House 14, Road 6, Sector 11, Uttara, Dhaka, Bangladesh';

  return (
    <footer className="bg-[#0B132B] text-slate-400 text-xs border-t border-slate-800">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-900 to-emerald-950 border border-amber-500/40 text-amber-300 font-serif-luxury font-bold text-base flex items-center justify-center">
              AR
            </div>
            <div>
              <span className="font-serif-luxury font-bold text-white text-base block tracking-tight">
                {businessName}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold block">
                Haute Couture
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-normal">
            Handcrafted traditional & contemporary clothing tailored for perfection across Bangladesh.
          </p>
          <div className="pt-2 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck size={14} />
            <span>100% Quality Organic Fabrics</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Quick Links
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-emerald-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-emerald-400 transition-colors">
                Complete Catalog
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=featured" className="hover:text-emerald-400 transition-colors">
                Featured Highlights
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=new" className="hover:text-emerald-400 transition-colors">
                New Arrivals 2026
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-emerald-400 transition-colors">
                Brand Heritage
              </Link>
            </li>
          </ul>
        </div>

        {/* Store Policies */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Store Policies
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/policies/shipping-policy" className="hover:text-emerald-400 transition-colors">
                Shipping & Nationwide Delivery
              </Link>
            </li>
            <li>
              <Link href="/policies/return-policy" className="hover:text-emerald-400 transition-colors">
                Return & Size Exchange
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy-policy" className="hover:text-emerald-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms-conditions" className="hover:text-emerald-400 transition-colors">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info & WhatsApp order */}
        <div className="space-y-3">
          <h4 className="text-white font-serif-luxury font-bold text-sm tracking-wider uppercase">
            Order Helpline
          </h4>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="block text-slate-200 font-mono font-bold">{primaryPhone}</span>
                <span className="text-[10px] text-slate-400">WhatsApp & Direct Calls (10 AM - 10 PM)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail size={14} className="text-emerald-400 shrink-0" />
              <span className="text-slate-300">{email}</span>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-slate-400 leading-relaxed">{address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 bg-[#070D1E] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Handcrafted with <Heart size={12} className="text-rose-500 fill-rose-500 inline" /> for fashion connoisseurs.
          </p>
        </div>
      </div>
    </footer>
  );
}
