'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Filter,
  X,
  Check,
  ArrowUpDown,
  ShoppingBag,
  Sparkles,
  SlidersHorizontal,
  RotateCcw,
  Crown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Portal from '@/components/ui/Portal';
import { FALLBACK_PRODUCT_IMAGE } from '@/lib/imageUtils';

export default function ShopCatalogClient({
  products = [],
  categories = [],
  availableSizes = [],
  availableColours = [],
  allVariants = [],
  currencySymbol = '₹',
  categorySlug = '',
  searchQuery = '',
  sort = 'newest',
  sizeFilter = '',
  colourFilter = '',
  inStockOnly = false,
  filterType = '',
}) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [drawerOpen]);

  // Helper to construct filter URL
  const buildUrl = (overrides = {}) => {
    const params = new URLSearchParams();

    const merged = {
      category: categorySlug,
      search: searchQuery,
      sort,
      size: sizeFilter,
      colour: colourFilter,
      inStock: inStockOnly ? 'true' : '',
      filter: filterType,
      ...overrides,
    };

    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== false) {
        params.set(k, String(v));
      }
    });

    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  // Count how many filters are active
  const activeFilterCount = [
    Boolean(categorySlug),
    Boolean(sizeFilter),
    Boolean(colourFilter),
    Boolean(inStockOnly),
    Boolean(searchQuery),
  ].filter(Boolean).length;

  const activeCategoryObj = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="space-y-6">
      {/* 1. Sleek Luxury Top Filter & Sorting Bar */}
      <div className="bg-[#0E0E14] rounded-2xl border border-amber-500/20 p-3 sm:p-4 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Filter Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 gold-gradient-btn text-black rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              <SlidersHorizontal size={14} className="text-black" />
              <span>Filter Products</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-black text-amber-300 font-black text-[10px] flex items-center justify-center border border-amber-400">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <Link
                href="/shop"
                className="text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </Link>
            )}
          </div>

          {/* Right: Quick Sorting */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-stone-400 font-semibold hidden md:inline flex items-center gap-1">
              <ArrowUpDown size={13} className="text-amber-400" />
              Sort:
            </span>
            <div className="flex items-center gap-1 bg-[#14141C] p-1 rounded-xl border border-white/5">
              {[
                { label: 'Newest', key: 'newest' },
                { label: 'Price: Low-High', key: 'price_asc' },
                { label: 'Price: High-Low', key: 'price_desc' },
              ].map((s) => (
                <Link
                  key={s.key}
                  href={buildUrl({ sort: s.key })}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                    sort === s.key
                      ? 'gold-gradient-btn text-black shadow-sm font-black'
                      : 'text-stone-400 hover:text-amber-300'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Pills */}
        {activeFilterCount > 0 && (
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-amber-400/70 uppercase tracking-widest mr-1">
              Active:
            </span>

            {categorySlug && (
              <Link
                href={buildUrl({ category: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-colors"
              >
                <span>Category: {activeCategoryObj?.name || categorySlug}</span>
                <X size={12} />
              </Link>
            )}

            {sizeFilter && (
              <Link
                href={buildUrl({ size: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-colors"
              >
                <span>Size: {sizeFilter}</span>
                <X size={12} />
              </Link>
            )}

            {colourFilter && (
              <Link
                href={buildUrl({ colour: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-colors"
              >
                <span>Colour: {colourFilter}</span>
                <X size={12} />
              </Link>
            )}

            {inStockOnly && (
              <Link
                href={buildUrl({ inStock: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-colors"
              >
                <span>In-Stock Only</span>
                <X size={12} />
              </Link>
            )}

            {searchQuery && (
              <Link
                href={buildUrl({ search: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-600 text-stone-200 font-bold hover:bg-stone-700 transition-colors"
              >
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <X size={12} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 2. Slide-Over Filter Drawer Modal (Obsidian & Gold Glass) */}
      {drawerOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-in fade-in"
            />

            {/* Slide-in Panel */}
            <div className="relative w-full max-w-md bg-[#0C0C12] text-stone-100 h-full shadow-2xl border-l border-amber-500/30 flex flex-col z-10 animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-amber-500/20 flex items-center justify-between bg-[#07070A]">
                <div className="flex items-center gap-2.5">
                  <Crown size={18} className="text-amber-400" />
                  <div>
                    <h3 className="font-royal-title font-black text-base text-white">Filter Catalog</h3>
                    <p className="text-[10px] text-amber-300/80 uppercase tracking-widest">
                      Tailor by collection, size & colour
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
                {/* 1. Category Options */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">
                      Collection / Category
                    </h4>
                    {categorySlug && (
                      <Link
                        href={buildUrl({ category: '' })}
                        onClick={() => setDrawerOpen(false)}
                        className="text-[11px] text-amber-300 font-bold hover:underline"
                      >
                        Show All
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <Link
                      href={buildUrl({ category: '' })}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                        !categorySlug
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                          : 'bg-[#121218] border-white/5 text-stone-300 hover:bg-[#181822]'
                      }`}
                    >
                      <span>All Collections</span>
                      {!categorySlug && <Check size={14} className="text-amber-400" />}
                    </Link>

                    {categories.map((c) => {
                      const isSelected = categorySlug === c.slug;
                      return (
                        <Link
                          key={c.id}
                          href={buildUrl({ category: isSelected ? '' : c.slug })}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                              : 'bg-[#121218] border-white/5 text-stone-300 hover:bg-[#181822]'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {c.image && (
                              <img src={c.image} alt="" className="w-6 h-6 rounded-md object-cover" />
                            )}
                            <span>{c.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-amber-400" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. In-Stock Only Toggle */}
                <div className="border-t border-white/5 pt-5">
                  <Link
                    href={buildUrl({ inStock: inStockOnly ? '' : 'true' })}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      inStockOnly
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-bold'
                        : 'bg-[#121218] border-white/5 text-stone-300 hover:bg-[#181822]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Ready-to-Ship / In Stock Only</div>
                      <div className="text-[10px] text-stone-400">Hide outfits currently sold out</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        inStockOnly
                          ? 'bg-amber-400 border-amber-400 text-black'
                          : 'border-stone-600 bg-stone-900'
                      }`}
                    >
                      {inStockOnly && <Check size={13} strokeWidth={3} />}
                    </div>
                  </Link>
                </div>

                {/* 3. Sizes */}
                {availableSizes.length > 0 && (
                  <div className="border-t border-white/5 pt-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">
                        Available Sizes
                      </h4>
                      {sizeFilter && (
                        <Link
                          href={buildUrl({ size: '' })}
                          onClick={() => setDrawerOpen(false)}
                          className="text-[11px] text-amber-300 font-bold hover:underline"
                        >
                          Clear Size
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((sz) => {
                        const isSelected = sizeFilter === sz;
                        return (
                          <Link
                            key={sz}
                            href={buildUrl({ size: isSelected ? '' : sz })}
                            onClick={() => setDrawerOpen(false)}
                            className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all ${
                              isSelected
                                ? 'gold-gradient-btn text-black shadow-md'
                                : 'bg-[#121218] text-stone-300 border-white/5 hover:bg-[#181822] hover:text-white'
                            }`}
                          >
                            {sz}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 4. Colour Palette */}
                {availableColours.length > 0 && (
                  <div className="border-t border-white/5 pt-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-amber-400 uppercase tracking-widest text-[11px]">
                        Colour Palette
                      </h4>
                      {colourFilter && (
                        <Link
                          href={buildUrl({ colour: '' })}
                          onClick={() => setDrawerOpen(false)}
                          className="text-[11px] text-amber-300 font-bold hover:underline"
                        >
                          Clear Colour
                        </Link>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {availableColours.map((cl) => {
                        const isSelected = colourFilter === cl;
                        const matchVar = allVariants.find((v) => v.colour === cl);
                        return (
                          <Link
                            key={cl}
                            href={buildUrl({ colour: isSelected ? '' : cl })}
                            onClick={() => setDrawerOpen(false)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-sm'
                                : 'bg-[#121218] text-stone-300 border-white/5 hover:bg-[#181822]'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                              style={{ backgroundColor: matchVar?.colourCode || '#1E293B' }}
                            />
                            <span className="truncate">{cl}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Bar */}
              <div className="p-4 border-t border-amber-500/20 bg-[#07070A] flex items-center justify-between gap-3">
                <Link
                  href="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2.5 border border-amber-500/30 text-stone-300 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-colors uppercase tracking-wider"
                >
                  Reset All
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 gold-gradient-btn text-black rounded-xl text-xs font-black shadow-md transition-all uppercase tracking-wider cursor-pointer"
                >
                  View {products.length} Results &rarr;
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 3. Product Grid */}
      {products.length === 0 ? (
        <div className="bg-[#0E0E14] rounded-3xl border border-amber-500/20 p-12 text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-full bg-stone-900 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h3 className="font-royal-title font-bold text-white text-lg">No Outfits Found</h3>
          <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find any outfits matching your selected filter criteria. Try clearing some filters.
          </p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 gold-gradient-btn text-black rounded-xl text-xs font-black shadow-sm uppercase tracking-wider"
          >
            Reset All Filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {products.map((prod) => {
            const totalStock = prod.variants?.reduce((s, v) => s + (v.stock || 0), 0) ?? 0;
            const isOutOfStock = totalStock <= 0;
            const uniqueColours = [...new Set(prod.variants?.map((v) => v.colourCode || '#1E293B'))].slice(0, 4);

            const colourSpecific = colourFilter
              ? prod.images?.find((img) => img.colour && img.colour.toLowerCase() === colourFilter.toLowerCase())?.url
              : null;
            const cardImage = colourSpecific || prod.mainImage;

            return (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                className="group bg-[#0E0E14] rounded-2xl sm:rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Photo showcase with badges */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
                  {cardImage ? (
                    <img
                      src={cardImage}
                      alt={prod.name}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                      No Photo
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {prod.isNewArrival && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-black text-amber-400 border border-amber-500/40 shadow-xs">
                        NEW
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 shadow-xs">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Card */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                      {prod.category?.name}
                    </span>
                    <h3 className="font-serif-luxury font-bold text-stone-100 text-xs sm:text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                      {prod.name}
                    </h3>

                    {/* Colour dots */}
                    {uniqueColours.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {uniqueColours.map((code, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: code }}
                          />
                        ))}
                        {prod.variants?.length > 4 && (
                          <span className="text-[9px] text-stone-500 font-semibold ml-0.5">
                            +{prod.variants.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fully mobile-proof pricing & action button row */}
                  <div className="pt-2 mt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-xs sm:text-base font-black text-amber-400 font-serif-luxury">
                        {formatPrice(prod.sellingPrice, currencySymbol)}
                      </span>
                      {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                        <span className="text-[9px] sm:text-xs text-stone-500 line-through">
                          {formatPrice(prod.originalPrice, currencySymbol)}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] sm:text-[11px] font-extrabold gold-gradient-btn px-2 py-0.5 rounded-md self-start sm:self-auto shrink-0">
                      View Piece &rarr;
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
