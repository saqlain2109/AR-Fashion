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
  Crown,
} from 'lucide-react';

export default function StoreHeader({ settings = null, content = null, categories: initialCategories = null }) {
  const { totalCount, setDrawerOpen, settings: contextSettings } = useCart();
  const [headerSettings, setHeaderSettings] = useState(contextSettings || settings);
  const activeSettings = headerSettings || contextSettings || settings;
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState(initialCategories || []);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (contextSettings) {
      setHeaderSettings(contextSettings);
    } else if (settings) {
      setHeaderSettings(settings);
    }
  }, [contextSettings, settings]);

  useEffect(() => {
    const handleSettingsUpdated = (e) => {
      if (e?.detail) {
        setHeaderSettings(e.detail);
      }
    };
    window.addEventListener('store_settings_updated', handleSettingsUpdated);
    return () => window.removeEventListener('store_settings_updated', handleSettingsUpdated);
  }, []);

  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategories(initialCategories);
    }
  }, [initialCategories]);

  useEffect(() => {
    async function loadNavCats() {
      try {
        const res = await fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadNavCats();

    const handleCatsUpdated = () => {
      loadNavCats();
    };
    window.addEventListener('categories_updated', handleCatsUpdated);
    return () => window.removeEventListener('categories_updated', handleCatsUpdated);
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

  const currencySym = activeSettings?.currencySymbol || '₹';
  const showAnnouncement = activeSettings ? activeSettings.announcementActive !== false : true;
  const rawAnnouncement = activeSettings?.storeAnnouncement
    || content?.announcementBar
    || `👑 AR Fashion House • Your Style Our Passion — Express Nationwide Delivery Above ${currencySym}2000`;
  const announcement = rawAnnouncement
    ? rawAnnouncement.replace(/[\uFFFD\?](?=\d)/g, currencySym).replace(/\uFFFD/g, currencySym)
    : '';

  const businessName = activeSettings?.businessName || 'AR Fashion House';
  const storeLogo = activeSettings?.storeLogo || '/images/ar-fashion-logo.jpg';

  const waPhone = activeSettings?.primaryPhone || '+917304396709';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <header className="sticky top-0 z-40 bg-[#070709]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-black/80">
      {/* 1. Top Royal Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-[#040406] text-amber-200/90 text-[11px] font-medium py-2 px-4 border-b border-amber-500/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <Crown size={13} className="text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <span className="truncate tracking-wide font-medium">{announcement}</span>
            </div>

            <div className="hidden md:flex items-center gap-5 shrink-0 text-stone-400 font-medium text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-300">
                <Truck size={13} />
                <span>All-India Express Delivery</span>
              </span>
              <span className="text-amber-500/30">|</span>
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
              >
                <Phone size={12} className="text-emerald-400" />
                <span>Concierge: {waPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Luxury Haute Couture Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-22 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Menu Toggle + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-amber-300 hover:bg-white/5 transition-colors shrink-0"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link href="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            {/* Logo Image */}
            <div className="relative h-10 sm:h-14 w-auto flex items-center shrink-0">
              <img
                src={storeLogo}
                alt={businessName}
                className="h-10 sm:h-14 w-auto object-contain rounded-lg drop-shadow-[0_2px_12px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Dynamic Brand Title & Tagline from Backend Settings */}
            <div className="leading-tight min-w-0">
              <span className="font-royal-title font-black text-xs sm:text-base lg:text-lg tracking-[0.14em] uppercase gold-gradient-text block truncate drop-shadow-sm">
                {businessName}
              </span>
              <span className="font-royal-script text-[11px] sm:text-xs lg:text-sm text-amber-300/90 tracking-wide block -mt-0.5 truncate">
                Your Style Our Passion
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Streamlined Luxury Desktop Menu */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] font-bold text-stone-300">
          <Link
            href="/"
            className="hover:text-amber-300 transition-colors py-2 tracking-wide uppercase text-xs hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="hover:text-amber-300 transition-colors py-2 tracking-wide uppercase text-xs hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
          >
            Shop Catalog
          </Link>

          {/* Collections Mega Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCatDropdownOpen(!catDropdownOpen)}
              onMouseEnter={() => setCatDropdownOpen(true)}
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors py-2 group tracking-wide uppercase text-xs"
            >
              <span>Collections</span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 text-amber-400 group-hover:text-amber-300 ${
                  catDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {catDropdownOpen && (
              <div
                onMouseLeave={() => setCatDropdownOpen(false)}
                className="absolute top-full -left-12 w-80 bg-[#0C0C12]/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-amber-500/30 p-3 grid gap-1.5 z-50 animate-fade-in text-stone-200"
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-400/80 border-b border-white/5 mb-1 flex items-center justify-between">
                  <span>Royal Collections</span>
                  <Crown size={12} className="text-amber-400" />
                </div>
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-amber-500/10 hover:border hover:border-amber-500/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-stone-900 border border-amber-500/20 shrink-0">
                        {c.image ? (
                          <img src={c.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-amber-400 font-bold">
                            AR
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-stone-200 group-hover:text-amber-300 transition-colors">
                        {c.name}
                      </span>
                    </div>
                    <ArrowRight size={13} className="text-stone-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
                <div className="border-t border-white/5 pt-2 px-1">
                  <Link
                    href="/shop"
                    onClick={() => setCatDropdownOpen(false)}
                    className="block text-center py-2.5 gold-gradient-btn font-extrabold text-xs rounded-xl shadow-md uppercase tracking-wider"
                  >
                    View Complete Catalog &rarr;
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/#about"
            className="hover:text-amber-300 transition-colors py-2 tracking-wide uppercase text-xs text-stone-400 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]"
          >
            Brand Heritage
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
                  placeholder="Search Panjabi, Saree, Kurtis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 sm:w-64 px-4 py-2 text-xs bg-[#121218] border border-amber-500/40 rounded-full focus:bg-[#181822] focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-100 placeholder-stone-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 text-stone-400 hover:text-amber-300"
                >
                  <X size={16} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full text-stone-300 hover:text-amber-300 hover:bg-white/5 transition-colors border border-transparent hover:border-amber-500/20"
                title="Search Outfits"
              >
                <Search size={18} />
              </button>
            )}
          </div>

          {/* Direct WhatsApp Order Pill */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(businessName)},%20I%20want%20to%20place%20an%20order.`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat & Order directly on WhatsApp"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-[#102418] hover:bg-[#153020] text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold transition-all shadow-sm hover:scale-[1.02]"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <Phone size={13} className="text-emerald-400" />
            <span>WhatsApp Order</span>
          </a>

          {/* Luxury Shopping Bag */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full gold-gradient-btn flex items-center gap-2 group cursor-pointer"
            aria-label="View Shopping Bag"
          >
            <ShoppingBag size={17} className="text-black group-hover:scale-110 transition-transform" />
            <span className="hidden md:inline text-xs font-black uppercase tracking-wider text-black">Bag</span>
            {totalCount > 0 && (
              <span className="w-5 h-5 bg-black text-amber-300 font-black text-[10px] rounded-full flex items-center justify-center border border-amber-400/80 shadow-sm">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Mobile Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-amber-500/20 bg-[#0A0A0F]/98 backdrop-blur-2xl p-5 space-y-4 animate-fade-in shadow-2xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400/60" />
            <input
              type="text"
              placeholder="Search by product, fabric, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-[#121218] border border-amber-500/30 rounded-xl font-medium focus:bg-[#181822] focus:outline-none focus:ring-2 focus:ring-amber-400 text-stone-100 placeholder-stone-500"
            />
          </form>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1 text-sm font-bold text-stone-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl hover:text-amber-300 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-amber-400 font-extrabold flex items-center justify-between"
            >
              <span>Shop All Outfits</span>
              <span>&rarr;</span>
            </Link>

            <div className="pt-2 pb-1 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-amber-400/70 px-2.5 flex items-center justify-between">
              <span>Collections</span>
              <Crown size={12} className="text-amber-400" />
            </div>

            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 hover:bg-white/5 rounded-xl text-stone-300 hover:text-amber-300 flex items-center justify-between transition-colors"
              >
                <span>{c.name}</span>
                <span className="text-xs text-amber-400/60">&rarr;</span>
              </Link>
            ))}

            <Link
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 hover:bg-white/5 rounded-xl text-stone-400 hover:text-amber-300 border-t border-white/5 pt-3 transition-colors"
            >
              Brand Heritage & Craft
            </Link>
          </nav>

          {/* Mobile WhatsApp Quick Call Banner */}
          <a
            href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(businessName)},%20I%20have%20an%20order%20inquiry.`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <Phone size={14} />
            <span>Direct WhatsApp Order Helpline</span>
          </a>
        </div>
      )}
    </header>
  );
}
