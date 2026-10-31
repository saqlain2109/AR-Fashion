'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function StoreHeader({ settings = null, content = null }) {
  const { totalCount, setDrawerOpen } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadNavCats() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories.slice(0, 5));
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNavCats();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const announcement = settings?.announcementActive && settings?.storeAnnouncement
    ? settings.storeAnnouncement
    : (content?.announcementBar || '✨ Free Nationwide Delivery on all orders over ৳2000! Instant WhatsApp order confirmation.');

  const waPhone = settings?.primaryPhone || '+8801700000000';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* 1. Announcement Bar */}
      {announcement && (
        <div className="bg-[#0B132B] text-emerald-300 text-[11px] font-semibold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2">
          <Sparkles size={13} className="text-emerald-400 shrink-0" />
          <span className="truncate max-w-2xl">{announcement}</span>
        </div>
      )}

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          {settings?.storeLogo ? (
            <img src={settings.storeLogo} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-emerald-800/30">
              AR
            </div>
          )}
          <div className="leading-none">
            <span className="font-black text-slate-950 text-lg tracking-tight block">
              {settings?.businessName || 'AR FASHION HOUSE'}
            </span>
            <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest block mt-0.5">
              Traditional & Contemporary
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
          <Link href="/" className="hover:text-emerald-600 transition-colors">
            Home
          </Link>
          <Link href="/shop" className="hover:text-emerald-600 transition-colors">
            Shop All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="hover:text-emerald-600 transition-colors whitespace-nowrap"
            >
              {c.name}
            </Link>
          ))}
          <Link href="/#about" className="hover:text-emerald-600 transition-colors">
            Brand Story
          </Link>
        </nav>

        {/* Right Actions: Search, WhatsApp Chat, Cart */}
        <div className="flex items-center gap-3">
          {/* Search bar (desktop) */}
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 lg:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Panjabi, Saree..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-medium"
            />
          </form>

          {/* Direct WhatsApp CTA Button */}
          <a
            href={`https://wa.me/${waPhone.replace(/[^0-9]/g, '')}?text=Hello%20AR%20Fashion%20House,%20I%20have%20an%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat with sales on WhatsApp"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors"
          >
            <Phone size={13} className="text-emerald-600" />
            <span className="hidden xl:inline">WhatsApp Order</span>
          </a>

          {/* Cart Icon & Live Count */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 flex items-center justify-center group"
          >
            <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-xs border-2 border-white animate-in zoom-in">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-4 animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl"
            />
          </form>

          <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-lg"
            >
              Shop All Products
            </Link>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-lg text-slate-600"
            >
              Our Heritage & Story
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
