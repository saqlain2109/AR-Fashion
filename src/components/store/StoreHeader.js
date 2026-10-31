'use client';
import { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export default function StoreHeader({ settings = null, content = null }) {
  const { totalCount, setDrawerOpen } = useCart();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function loadNavCats() {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNavCats();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const rawAnnouncement = settings?.announcementActive && settings?.storeAnnouncement
    ? settings.storeAnnouncement
    : (content?.announcementBar || 'Special Festive Offer: FREE Delivery all across Bangladesh on orders over ৳2000!');
  const announcement = rawAnnouncement ? rawAnnouncement.replace(/\uFFFD/g, '৳') : '';

  const waPhone = settings?.primaryPhone || '+8801700000000';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      {/* 1. Top Luxury Announcement & Quick Info Bar */}
      <div className="bg-[#0B132B] text-slate-300 text-[11px] font-medium py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <Sparkles size={12} className="text-amber-400 shrink-0" />
            <span className="truncate tracking-wide">{announcement}</span>
          </div>

          <div className="hidden md:flex items-center gap-5 shrink-0 text-slate-400 font-medium text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Truck size={13} />
              <span>Nationwide Home Delivery</span>
            </span>
            <span className="text-slate-600">|</span>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone size={12} className="text-emerald-400" />
              <span>Helpline: {waPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main High-Fashion Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" className="flex items-center gap-3 group">
            {/* Monogram Seal */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-amber-500/30 text-amber-300 font-serif-luxury font-bold text-lg flex items-center justify-center shadow-md tracking-wider group-hover:border-amber-400 transition-all">
              AR
            </div>
            <div className="leading-tight">
              <span className="font-serif-luxury font-black text-slate-950 text-lg sm:text-xl tracking-tight block">
                AR FASHION HOUSE
              </span>
              <span className="text-[9px] font-extrabold text-emerald-800 uppercase tracking-[0.2em] block">
                Traditional &bull; Contemporary
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Streamlined Luxury Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] font-bold text-slate-800">
          <Link
            href="/"
            className="hover:text-emerald-700 transition-colors py-2"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="hover:text-emerald-700 transition-colors py-2"
          >
            Shop All
          </Link>

          {/* Categories Mega Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              onMouseEnter={() => setCatDropdownOpen(true)}
              className="flex items-center gap-1 hover:text-emerald-700 transition-colors py-2 group"
            >
              <span>Collections</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-slate-400 group-hover:text-emerald-700 ${
                  catDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {catDropdownOpen && (
              <div
                onMouseLeave={() => setCatDropdownOpen(false)}
                className="absolute top-full -left-12 w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 grid gap-1.5 z-50 animate-fade-in"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-stone-100 mb-1">
                  Apparel Categories
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-100 border border-stone-200 shrink-0">
                        {c.image ? (
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">
                            AR
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                        {c.name}
                      </span>
                    </div>
                    <ArrowRight size={13} className="text-slate-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ))}
                <div className="border-t border-stone-100 pt-2 px-1">
                  <Link
                    href="/shop"
                    onClick={() => setCatDropdownOpen(false)}
                    className="block text-center py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                  >
                    View Complete Catalog &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/shop?category=mens-panjabi-kurta"
            className="hover:text-emerald-700 transition-colors py-2"
          >
            Panjabis
          </Link>

          <Link
            href="/shop?category=womens-sarees-anarkalis"
            className="hover:text-emerald-700 transition-colors py-2"
          >
            Sarees & Kurtis
          </Link>

          <Link
            href="/#about"
            className="hover:text-emerald-700 transition-colors py-2 text-slate-600"
          >
            Our Heritage
          </Link>
        </nav>

        {/* Right: Search, WhatsApp Order & Shopping Bag */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Search Trigger */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-1.5 animate-fade-in">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search Panjabi, Saree..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-60 px-3.5 py-1.5 text-xs bg-stone-100 border border-stone-300 rounded-full focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-900 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-slate-700 hover:bg-stone-100 transition-colors"
                title="Search Products"
              >
                <Search size={19} />
              </button>
            )}
          </div>

          {/* Direct WhatsApp Order Pill */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20AR%20Fashion%20House,%20I%20want%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat & Order directly on WhatsApp"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 rounded-full text-xs font-bold transition-all shadow-2xs hover:scale-[1.02]"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Phone size={13} className="text-emerald-700" />
            <span>WhatsApp Order</span>
          </a>

          {/* Luxury Shopping Bag */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 sm:px-3.5 sm:py-2 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/15 flex items-center gap-2 group"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={17} className="group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-bold">Bag</span>
            {totalCount > 0 && (
              <span className="w-5 h-5 bg-emerald-500 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center border-2 border-slate-900">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white p-5 space-y-4 animate-fade-in shadow-xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product, fabric, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-100 border border-stone-200 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1 text-sm font-bold text-slate-800">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-stone-50 rounded-xl"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-stone-50 rounded-xl text-emerald-800 font-extrabold"
            >
              Shop All Outfits &rarr;
            </Link>

            <div className="pt-2 pb-1 border-t border-stone-100 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
              Collections
            </div>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-stone-50 rounded-xl text-slate-700 flex items-center justify-between"
              >
                <span>{c.name}</span>
                <span className="text-xs text-slate-400">&rarr;</span>
              </Link>
            ))}

            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-stone-50 rounded-xl text-slate-600 border-t border-stone-100 pt-3"
            >
              Our Heritage & Craft
            </Link>
          </nav>

          {/* Mobile WhatsApp Quick Call Banner */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20AR%20Fashion%20House,%20I%20have%20an%20order%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
          >
            <Phone size={14} />
            <span>Direct WhatsApp Order Helpline</span>
          </a>
        </div>
      )}
    </header>
  );
}
