import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, Heart, Sparkles, MessageCircle, Crown } from 'lucide-react';

export default function StoreFooter({ settings = null }) {
  const businessName = settings?.businessName || 'AR Fashion House';
  const primaryPhone = settings?.primaryPhone || '+917304396709';
  const secondaryPhone = settings?.secondaryPhone || '+918080010107';
  const email = settings?.businessEmail || 'contact@arfashionhouse.com';
  const address = settings?.address;
  const storeLogo = settings?.storeLogo || '/images/ar-fashion-logo.jpg';
  const facebookUrl = settings?.facebookUrl;
  const instagramUrl = settings?.instagramUrl;
  const whatsappUrl = settings?.whatsappUrl;

  const cleanPrimary = primaryPhone.replace(/[^0-9]/g, '');
  const cleanSecondary = secondaryPhone ? secondaryPhone.replace(/[^0-9]/g, '') : null;

  return (
    <footer className="bg-[#040406] text-stone-400 text-xs border-t border-amber-500/20">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand Col */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <img
              src={storeLogo}
              alt={businessName}
              className="h-14 w-auto object-contain rounded-lg drop-shadow-[0_2px_10px_rgba(212,175,55,0.3)]"
            />
            <div>
              <span className="font-royal-title font-black text-white text-base block tracking-[0.14em] uppercase gold-gradient-text">
                {businessName}
              </span>
              <span className="font-royal-script text-sm text-amber-300/90 tracking-wide block -mt-0.5">
                Your Style Our Passion
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed font-normal">
            Handcrafted traditional & contemporary ethnic luxury clothing tailored with pure fabrics and intricate zari masterworks.
          </p>
          <div className="pt-2 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
            <Crown size={14} className="text-amber-400" />
            <span>100% Authentic Handloom & Master Embroidery</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-royal-title text-amber-200 font-bold text-xs tracking-widest uppercase">
            Quick Navigation
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-amber-300 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-amber-300 transition-colors">
                Complete Catalog
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=featured" className="hover:text-amber-300 transition-colors">
                Featured Highlights
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=new" className="hover:text-amber-300 transition-colors">
                New Arrivals 2026
              </Link>
            </li>
            <li>
              <Link href="/#about" className="hover:text-amber-300 transition-colors">
                Brand Heritage & Atelier
              </Link>
            </li>
          </ul>
        </div>

        {/* Store Policies */}
        <div className="space-y-3">
          <h4 className="font-royal-title text-amber-200 font-bold text-xs tracking-widest uppercase">
            Store Policies
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link href="/policies/shipping-policy" className="hover:text-amber-300 transition-colors">
                Shipping & Express Delivery
              </Link>
            </li>
            <li>
              <Link href="/policies/return-policy" className="hover:text-amber-300 transition-colors">
                Return & Size Exchange
              </Link>
            </li>
            <li>
              <Link href="/policies/privacy-policy" className="hover:text-amber-300 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/policies/terms-conditions" className="hover:text-amber-300 transition-colors">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact info & WhatsApp order */}
        <div className="space-y-3">
          <h4 className="font-royal-title text-amber-200 font-bold text-xs tracking-widest uppercase">
            Contact & WhatsApp
          </h4>
          <div className="space-y-3 text-xs">
            {/* Primary Phone / WhatsApp */}
            <div className="flex items-start gap-2.5">
              <Phone size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <a
                  href={`https://wa.me/${cleanPrimary}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-stone-100 font-mono font-bold hover:text-amber-300 transition-colors"
                >
                  {primaryPhone}
                </a>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <MessageCircle size={10} />
                  <span>Primary WhatsApp Concierge</span>
                </span>
              </div>
            </div>

            {/* Secondary Phone if available */}
            {cleanSecondary && (
              <div className="flex items-start gap-2.5">
                <Phone size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`https://wa.me/${cleanSecondary}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-stone-300 font-mono font-bold hover:text-amber-300 transition-colors"
                  >
                    {secondaryPhone}
                  </a>
                  <span className="text-[10px] text-amber-400/80 font-medium">
                    Secondary Support Line
                  </span>
                </div>
              </div>
            )}

            {/* Email */}
            {email && (
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-amber-400 shrink-0" />
                <a
                  href={`mailto:${email}`}
                  className="text-stone-300 hover:text-amber-300 transition-colors truncate"
                >
                  {email}
                </a>
              </div>
            )}

            {/* Address */}
            {address && (
              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-stone-400 leading-snug">{address}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5 py-6 bg-black/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-500">
          <div className="flex items-center gap-2">
            <Crown size={12} className="text-amber-400" />
            <span>&copy; {new Date().getFullYear()} {businessName}. All rights reserved.</span>
          </div>
          <div className="font-royal-script text-amber-300/80 text-sm">
            Your Style Our Passion
          </div>
        </div>
      </div>
    </footer>
  );
}
