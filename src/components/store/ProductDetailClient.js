'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Check,
  Phone,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Minus,
  Plus,
  Share2,
  AlertCircle,
  Camera,
  Crown,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { FALLBACK_PRODUCT_IMAGE } from '@/lib/imageUtils';

export default function ProductDetailClient({ product, settings }) {
  const { addToCart, setDrawerOpen } = useCart();

  // 1. Raw image objects with optional colour tags: [{ url, colour }, ...]
  const rawImages = useMemo(() => {
    const list = (product.images || []).map((img) => ({
      url: typeof img === 'string' ? img : img.url,
      colour: typeof img === 'object' ? img.colour || '' : '',
    }));
    if (product.mainImage && !list.some((i) => i.url === product.mainImage)) {
      list.unshift({ url: product.mainImage, colour: '' });
    }
    return list.length > 0
      ? list
      : [{ url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80', colour: '' }];
  }, [product]);

  // 2. Extract all unique colour variants
  const availableColours = useMemo(() => {
    const map = new Map();
    (product.variants || []).forEach((v) => {
      if (!map.has(v.colour)) {
        // Find if any image is specifically tagged for this colour
        const colourImg = rawImages.find(
          (img) => img.colour && img.colour.toLowerCase() === v.colour.toLowerCase()
        );
        map.set(v.colour, {
          name: v.colour,
          code: v.colourCode || '#1E293B',
          imageUrl: colourImg ? colourImg.url : rawImages[0]?.url,
        });
      }
    });
    return Array.from(map.values());
  }, [product.variants, rawImages]);

  // Active colour selection
  const [selectedColour, setSelectedColour] = useState(
    availableColours[0]?.name || ''
  );

  // 3. Dynamically filter displayed images based on selectedColour
  const displayedImages = useMemo(() => {
    if (!selectedColour) return rawImages.map((i) => i.url);
    const colourSpecific = rawImages.filter(
      (img) => img.colour && img.colour.toLowerCase() === selectedColour.toLowerCase()
    );
    if (colourSpecific.length > 0) {
      const general = rawImages.filter((img) => !img.colour);
      return [...colourSpecific, ...general].map((i) => i.url);
    }
    return rawImages.map((i) => i.url);
  }, [rawImages, selectedColour]);

  // Active display image
  const [activeImage, setActiveImage] = useState(
    displayedImages[0] || rawImages[0]?.url
  );

  // Available sizes under the selected colour
  const sizesForColour = useMemo(() => {
    return (product.variants || []).filter((v) => v.colour === selectedColour);
  }, [product.variants, selectedColour]);

  // Selected Variant ID
  const [selectedVariantId, setSelectedVariantId] = useState(
    sizesForColour[0]?.id || ''
  );

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  const handleColourChange = (colourObj) => {
    setSelectedColour(colourObj.name);

    const matchImg = rawImages.find(
      (img) => img.colour && img.colour.toLowerCase() === colourObj.name.toLowerCase()
    );

    if (matchImg) {
      setActiveImage(matchImg.url);
    } else if (colourObj.imageUrl) {
      setActiveImage(colourObj.imageUrl);
    }

    const availableVariants = (product.variants || []).filter((v) => v.colour === colourObj.name);
    if (availableVariants.length > 0) {
      const inStockOne = availableVariants.find((v) => v.stock > 0) || availableVariants[0];
      setSelectedVariantId(inStockOne.id);
      setQuantity(1);
    }
  };

  // Currently active variant object
  const activeVariant = useMemo(() => {
    return (
      (product.variants || []).find((v) => v.id === selectedVariantId) ||
      sizesForColour[0] ||
      null
    );
  }, [product.variants, selectedVariantId, sizesForColour]);

  // Pricing calculation
  const effectivePrice =
    activeVariant?.price !== null && activeVariant?.price !== undefined
      ? activeVariant.price
      : product.sellingPrice;

  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;
  const maxStock = activeVariant?.stock || 0;

  // Add to cart handler
  const handleAddToCart = () => {
    if (isOutOfStock || !activeVariant) return;
    addToCart(product, activeVariant, quantity);
  };

  const currencySymbol = settings?.currencySymbol || '₹';
  const waPhone = settings?.primaryPhone || '+917304396709';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      {/* 1. High-Resolution Photographs Showcase */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-900 border border-amber-500/20 shadow-2xl relative group">
          <img
            key={activeImage}
            src={activeImage}
            alt={`${product.name} in ${selectedColour}`}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
            }}
            className="w-full h-full object-cover transition-all duration-500 animate-fade-in group-hover:scale-105"
          />

          {/* Active Colour Indicator Badge on Photo */}
          <div className="absolute bottom-4 left-4 bg-[#0A0A0E]/90 backdrop-blur-md text-amber-200 text-xs font-semibold px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-lg border border-amber-500/30">
            <span
              className="w-3.5 h-3.5 rounded-full border border-white/60 shadow-xs"
              style={{
                backgroundColor:
                  availableColours.find((c) => c.name === selectedColour)?.code || '#1E293B',
              }}
            />
            <span className="font-bold">{selectedColour}</span>
            {displayedImages.length > 1 && (
              <span className="text-[10px] text-amber-400/70 border-l border-amber-500/30 pl-2">
                {displayedImages.length} photos
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-black text-amber-400 border border-amber-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                New Arrival
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails list filtered for this specific colour */}
        {displayedImages.length > 1 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-400 px-1">
              <span className="flex items-center gap-1.5">
                <Camera size={13} className="text-amber-400" />
                <span>Photographs in {selectedColour}</span>
              </span>
              <span className="text-[10px] text-amber-400/80">Click photo to zoom</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {displayedImages.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-amber-400 ring-2 ring-amber-400/40 scale-105 shadow-md shadow-amber-500/20'
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-amber-500/40'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>Primary perspective for {selectedColour}</span>
          </div>
        )}
      </div>

      {/* 2. Interactive Product Details & Variant Selectors */}
      <div className="space-y-6 bg-[#0E0E14] p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-xl">
        <div>
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/30 inline-flex items-center gap-1.5">
            <Crown size={12} className="text-amber-400" />
            <span>{product.category?.name || 'Haute Couture'}</span>
          </span>
          <h1 className="font-royal-title text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mt-3 leading-snug">
            {product.name}
          </h1>
          <p className="text-xs font-mono text-stone-400 mt-1.5">
            SKU: <strong className="text-amber-300 font-bold">{activeVariant?.sku || product.sku}</strong>
          </p>
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-3 pb-4 border-b border-white/5">
          <span className="text-3xl sm:text-4xl font-black text-amber-400 font-serif-luxury">
            {formatPrice(effectivePrice, currencySymbol)}
          </span>
          {product.originalPrice && product.originalPrice > effectivePrice && (
            <>
              <span className="text-lg text-stone-500 line-through">
                {formatPrice(product.originalPrice, currencySymbol)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Save {formatPrice(product.originalPrice - effectivePrice, currencySymbol)}
              </span>
            </>
          )}
        </div>

        {/* 1. Interactive Colour Switcher */}
        {availableColours.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
              <span className="flex items-center gap-1.5">
                <span>Select Colour:</span>
                <strong className="text-amber-400">{selectedColour}</strong>
              </span>
              <span className="text-stone-400 font-normal">
                ({availableColours.length} options)
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableColours.map((c) => {
                const isSelected = selectedColour === c.name;
                const colourStock = (product.variants || [])
                  .filter((v) => v.colour === c.name)
                  .reduce((sum, v) => sum + v.stock, 0);

                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColourChange(c)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold shadow-md shadow-amber-500/15'
                        : 'border-white/10 hover:border-amber-500/40 text-stone-300 bg-[#14141C]'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-2xs"
                      style={{ backgroundColor: c.code }}
                    />
                    <span className="text-xs">{c.name}</span>
                    {colourStock <= 0 ? (
                      <span className="text-[10px] text-rose-400 font-bold">(Sold Out)</span>
                    ) : isSelected ? (
                      <Check size={13} className="text-amber-400" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interactive Size Selector */}
        {sizesForColour.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-stone-200">
              <span>Select Size:</span>
              {activeVariant && (
                <span className="text-stone-400 font-medium">
                  {activeVariant.stock > 0 ? (
                    <span className="text-amber-400 font-bold">
                      {activeVariant.stock <= 5
                        ? `Only ${activeVariant.stock} left in stock!`
                        : `In Stock (${activeVariant.stock} units)`}
                    </span>
                  ) : (
                    <span className="text-rose-400 font-bold">Sold out in this size</span>
                  )}
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {sizesForColour.map((v) => {
                const isSelected = selectedVariantId === v.id;
                const outOfStock = v.stock <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedVariantId(v.id);
                      setQuantity(1);
                    }}
                    className={`py-3 px-2 rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'gold-gradient-btn text-black font-black shadow-lg shadow-amber-500/25 scale-[1.02]'
                        : outOfStock
                        ? 'border-white/5 bg-stone-900/50 text-stone-600 cursor-not-allowed line-through'
                        : 'border-white/10 bg-[#14141C] hover:border-amber-400 text-stone-300 font-bold'
                    }`}
                  >
                    <span className="text-xs font-mono">{v.size}</span>
                    {v.price && v.price !== product.sellingPrice && (
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-black' : 'text-stone-400'
                        }`}
                      >
                        {formatPrice(v.price, currencySymbol)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Quantity Counter */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-stone-200 block">Quantity:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-white/10 rounded-2xl overflow-hidden bg-[#14141C]">
              <button
                type="button"
                disabled={quantity <= 1 || isOutOfStock}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2.5 hover:bg-white/10 text-stone-300 disabled:opacity-40 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-12 text-center text-sm font-bold text-amber-300 font-mono">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxStock || isOutOfStock}
                onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                className="p-2.5 hover:bg-white/10 text-stone-300 disabled:opacity-40 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="text-xs text-stone-400">
              Total: <strong className="text-amber-400 font-black text-sm">{formatPrice(effectivePrice * quantity, currencySymbol)}</strong>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-full py-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-xl ${
              isOutOfStock
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed shadow-none'
                : 'gold-gradient-btn text-black cursor-pointer shadow-amber-500/20 active:scale-[0.99]'
            }`}
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? 'Sold Out in this Combination' : 'Add to Shopping Bag'}</span>
          </button>

          {/* Quick WhatsApp Inquiry for this outfit */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello AR Fashion House, I want to inquire about "${product.name}" in Colour: ${selectedColour}, Size: ${activeVariant?.size || 'Standard'}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-2xl font-bold text-xs bg-[#102418] hover:bg-[#153020] text-emerald-300 border border-emerald-500/30 flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Phone size={15} className="text-emerald-400" />
            <span>Chat on WhatsApp about this piece</span>
          </a>
        </div>

        {/* 5. Trust & Delivery Guarantees */}
        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2.5">
            <Truck size={17} className="text-amber-400 shrink-0" />
            <span>All-India Express Delivery</span>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw size={17} className="text-amber-400 shrink-0" />
            <span>7-Day Royal Size Exchange</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={17} className="text-amber-400 shrink-0" />
            <span>100% Pure Handloom & Silk</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles size={17} className="text-amber-400 shrink-0" />
            <span>Intricate Zari Needlework</span>
          </div>
        </div>

        {/* 6. Product Description */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <h3 className="font-bold text-stone-200 text-sm">Product Description & Care:</h3>
          <p className="text-xs text-stone-400 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
