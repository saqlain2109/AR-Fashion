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
      {/* 1. Sleek Top Filter Bar & Sorting Bar */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Filter Trigger Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <SlidersHorizontal size={14} className="text-emerald-400" />
              <span>Filter Products</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <Link
                href="/shop"
                className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 flex items-center gap-1 hover:underline"
              >
                <RotateCcw size={12} />
                <span className="hidden sm:inline">Reset Filters</span>
              </Link>
            )}
          </div>

          {/* Right: Quick Sorting */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-slate-500 font-semibold hidden md:inline flex items-center gap-1">
              <ArrowUpDown size={13} />
              Sort:
            </span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              {[
                { label: 'Newest', key: 'newest' },
                { label: 'Price: Low-High', key: 'price_asc' },
                { label: 'Price: High-Low', key: 'price_desc' },
              ].map((s) => (
                <Link
                  key={s.key}
                  href={buildUrl({ sort: s.key })}
                  className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-colors ${
                    sort === s.key
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
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
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Active:
            </span>

            {categorySlug && (
              <Link
                href={buildUrl({ category: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>Category: {activeCategoryObj?.name || categorySlug}</span>
                <X size={12} />
              </Link>
            )}

            {sizeFilter && (
              <Link
                href={buildUrl({ size: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>Size: {sizeFilter}</span>
                <X size={12} />
              </Link>
            )}

            {colourFilter && (
              <Link
                href={buildUrl({ colour: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>Colour: {colourFilter}</span>
                <X size={12} />
              </Link>
            )}

            {inStockOnly && (
              <Link
                href={buildUrl({ inStock: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold hover:bg-emerald-100 transition-colors"
              >
                <span>In-Stock Only</span>
                <X size={12} />
              </Link>
            )}

            {searchQuery && (
              <Link
                href={buildUrl({ search: '' })}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 border border-stone-300 text-slate-800 font-bold hover:bg-stone-200 transition-colors"
              >
                <span>&ldquo;{searchQuery}&rdquo;</span>
                <X size={12} />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* 2. Slide-Over Filter Drawer Modal */}
      {drawerOpen && (
        <Portal>
          <div className="fixed inset-0 z-[9999] flex justify-end">
            {/* Backdrop */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            />

            {/* Slide-in Panel */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
              {/* Drawer Top Header */}
              <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#0B132B] text-white">
                <div className="flex items-center gap-2.5">
                  <SlidersHorizontal size={18} className="text-emerald-400" />
                  <div>
                    <h3 className="font-serif-luxury font-black text-base text-white">Filter Outfits</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                      Tailor catalog by collection, size & color
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
                {/* 1. Category Options */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Collection / Category
                    </h4>
                    {categorySlug && (
                      <Link
                        href={buildUrl({ category: '' })}
                        onClick={() => setDrawerOpen(false)}
                        className="text-[11px] text-emerald-700 font-bold hover:underline"
                      >
                        Show All
                      </Link>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    <Link
                      href={buildUrl({ category: '' })}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        !categorySlug
                          ? 'bg-emerald-50 text-emerald-950 font-extrabold border-emerald-300 shadow-2xs'
                          : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                      }`}
                    >
                      <span>All Collections</span>
                      {!categorySlug && <Check size={14} className="text-emerald-700" />}
                    </Link>

                    {categories.map((cat) => {
                      const isSelected = categorySlug === cat.slug;
                      return (
                        <Link
                          key={cat.id}
                          href={buildUrl({ category: cat.slug })}
                          onClick={() => setDrawerOpen(false)}
                          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-950 font-extrabold border-emerald-300 shadow-2xs'
                              : 'bg-stone-50 border-stone-200 text-slate-700 hover:bg-stone-100'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-5 h-5 rounded-md object-cover" />
                            ) : null}
                            <span>{cat.name}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-emerald-700" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. In-Stock Items Only Toggle */}
                <div className="border-t border-stone-100 pt-5">
                  <Link
                    href={buildUrl({ inStock: inStockOnly ? '' : 'true' })}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-xs">In-Stock Only</p>
                      <p className="text-[10px] text-slate-500">Hide out-of-stock items</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        inStockOnly
                          ? 'bg-emerald-700 border-emerald-700 text-white'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {inStockOnly && <Check size={13} />}
                    </div>
                  </Link>
                </div>

                {/* 3. Sizes */}
                {availableSizes.length > 0 && (
                  <div className="border-t border-stone-100 pt-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        Available Sizes
                      </h4>
                      {sizeFilter && (
                        <Link
                          href={buildUrl({ size: '' })}
                          onClick={() => setDrawerOpen(false)}
                          className="text-[11px] text-emerald-700 font-bold hover:underline"
                        >
                          Clear Size
                        </Link>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map((sz) => {
                        const isSelected = sizeFilter === sz;
                        return (
                          <Link
                            key={sz}
                            href={buildUrl({ size: isSelected ? '' : sz })}
                            onClick={() => setDrawerOpen(false)}
                            className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs scale-105'
                                : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
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
                  <div className="border-t border-stone-100 pt-5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                        Colour Palette
                      </h4>
                      {colourFilter && (
                        <Link
                          href={buildUrl({ colour: '' })}
                          onClick={() => setDrawerOpen(false)}
                          className="text-[11px] text-emerald-700 font-bold hover:underline"
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
                                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                : 'bg-stone-50 text-slate-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
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
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between gap-3">
                <Link
                  href="/shop"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2.5 border border-stone-300 text-slate-700 hover:bg-white rounded-xl text-xs font-bold transition-colors"
                >
                  Reset All
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all"
                >
                  View {products.length} Results &rarr;
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* 3. Product Grid (Displays immediately at top with 0 unnecessary scrolling!) */}
      {products.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 my-6">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h3 className="font-serif-luxury font-bold text-slate-900 text-lg">No Outfits Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            We couldn&apos;t find any outfits matching your selected filter criteria. Try clearing some filters.
          </p>
          <Link
            href="/shop"
            className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 shadow-sm"
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
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Photo showcase with badges */}
                <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
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
                    <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                      No Photo
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                    {prod.isNewArrival && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                        NEW
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Card */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      {prod.category?.name}
                    </span>
                    <h3 className="font-serif-luxury font-bold text-slate-900 text-xs sm:text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                      {prod.name}
                    </h3>

                    {/* Colour dots */}
                    {uniqueColours.length > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {uniqueColours.map((code, idx) => (
                          <span
                            key={idx}
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: code }}
                          />
                        ))}
                        {prod.variants?.length > 4 && (
                          <span className="text-[9px] text-slate-400 font-semibold ml-0.5">
                            +{prod.variants.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Fully mobile-proof pricing & action button row */}
                  <div className="pt-2.5 mt-2.5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-1.5">
                    <div className="flex flex-wrap items-baseline gap-1">
                      <span className="text-sm sm:text-base font-black text-slate-900 font-serif-luxury">
                        {formatPrice(prod.sellingPrice, currencySymbol)}
                      </span>
                      {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                        <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                          {formatPrice(prod.originalPrice, currencySymbol)}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md group-hover:bg-emerald-100 transition-colors shrink-0">
                      View &rarr;
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
