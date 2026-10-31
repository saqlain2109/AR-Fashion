'use client';
import { useState, useMemo, useEffect } from 'react';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function ProductDetailClient({ product, settings }) {
  const { addToCart, setDrawerOpen } = useCart();

  // Images list
  const allImages = useMemo(() => {
    const list = product.images?.map((img) => (typeof img === 'string' ? img : img.url)) || [];
    if (product.mainImage && !list.includes(product.mainImage)) {
      list.unshift(product.mainImage);
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'];
  }, [product]);

  // Extract all unique colour variants
  const availableColours = useMemo(() => {
    const map = new Map();
    product.variants.forEach((v, idx) => {
      if (!map.has(v.colour)) {
        // Map colour to an image in allImages so switching colour updates the photograph!
        const imageIndex = map.size % allImages.length;
        map.set(v.colour, {
          name: v.colour,
          code: v.colourCode || '#1E293B',
          imageUrl: allImages[imageIndex] || allImages[0],
        });
      }
    });
    return Array.from(map.values());
  }, [product.variants, allImages]);

  // Active colour selection
  const [selectedColour, setSelectedColour] = useState(
    availableColours[0]?.name || ''
  );

  // Active display image (switches when colour switches!)
  const [activeImage, setActiveImage] = useState(
    availableColours[0]?.imageUrl || allImages[0]
  );

  // Available sizes under the selected colour
  const sizesForColour = useMemo(() => {
    return product.variants.filter((v) => v.colour === selectedColour);
  }, [product.variants, selectedColour]);

  // Selected Variant ID
  const [selectedVariantId, setSelectedVariantId] = useState(
    sizesForColour[0]?.id || ''
  );

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // When selectedColour changes:
  // 1. Switch the main image to the color's image
  // 2. Select the first available size in that color
  // 3. Reset quantity to 1
  const handleColourChange = (colourObj) => {
    setSelectedColour(colourObj.name);

    // Switch main photo to this colour's photo!
    if (colourObj.imageUrl) {
      setActiveImage(colourObj.imageUrl);
    }

    const availableVariants = product.variants.filter((v) => v.colour === colourObj.name);
    if (availableVariants.length > 0) {
      // Pick first in-stock variant, or first variant if all out
      const inStockOne = availableVariants.find((v) => v.stock > 0) || availableVariants[0];
      setSelectedVariantId(inStockOne.id);
      setQuantity(1);
    }
  };

  // Currently active variant object
  const activeVariant = useMemo(() => {
    return (
      product.variants.find((v) => v.id === selectedVariantId) ||
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

  const waPhone = settings?.primaryPhone || '+8801700000000';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-start">
      {/* 1. High-Resolution Photographs Showcase with Active Colour Sync */}
      <div className="space-y-4">
        {/* Main Display Image */}
        <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-md relative group">
          <img
            key={activeImage} // Key triggers smooth transition on colour switch
            src={activeImage}
            alt={`${product.name} in ${selectedColour}`}
            className="w-full h-full object-cover transition-all duration-500 animate-fade-in group-hover:scale-105"
          />

          {/* Active Colour Indicator Badge on Photo */}
          <div className="absolute bottom-4 left-4 bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span
              className="w-3 h-3 rounded-full border border-white/50"
              style={{
                backgroundColor:
                  availableColours.find((c) => c.name === selectedColour)?.code || '#1E293B',
              }}
            />
            <span>Colour: {selectedColour}</span>
          </div>

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
            {product.isNewArrival && (
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                New Arrival
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails list */}
        {allImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(img)}
                className={`w-20 h-24 rounded-2xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === img
                    ? 'border-emerald-700 ring-2 ring-emerald-600/30 scale-105 shadow-md'
                    : 'border-stone-200 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Interactive Product Details & Variant Selectors */}
      <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/90 shadow-sm">
        <div>
          <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            {product.category?.name || 'Exclusive Attire'}
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-black text-slate-950 tracking-tight mt-3 leading-snug">
            {product.name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1.5">
            SKU: <strong className="text-slate-700">{activeVariant?.sku || product.sku}</strong>
          </p>
        </div>

        {/* Price Display */}
        <div className="flex items-baseline gap-3 pb-4 border-b border-stone-100">
          <span className="text-3xl sm:text-4xl font-black text-slate-950 font-serif-luxury">
            {formatPrice(effectivePrice)}
          </span>
          {product.originalPrice && product.originalPrice > effectivePrice && (
            <>
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                Save {formatPrice(product.originalPrice - effectivePrice)}
              </span>
            </>
          )}
        </div>

        {/* 1. Interactive Colour Switcher (Switches photo & sizes!) */}
        {availableColours.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">
                1. Select Colour:{' '}
                <strong className="text-emerald-800 text-sm font-black underline decoration-emerald-500">
                  {selectedColour}
                </strong>
              </span>
              <span className="text-slate-400 font-normal">Click swatch to view shade</span>
            </div>

            <div className="flex flex-wrap gap-3">
              {availableColours.map((col) => {
                const isSelected = selectedColour === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleColourChange(col)}
                    className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-extrabold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-600/40 shadow-md scale-105'
                        : 'bg-stone-50 text-slate-800 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: col.code }}
                    />
                    <span>{col.name}</span>
                    {isSelected && <Check size={13} className="text-emerald-400 ml-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Interactive Size Selector for Current Colour */}
        <div className="space-y-2.5 pt-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-800">
              2. Select Size for {selectedColour}:
            </span>
            {activeVariant && (
              <span
                className={`text-[11px] font-extrabold ${
                  activeVariant.stock > 5
                    ? 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200'
                    : activeVariant.stock > 0
                    ? 'text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200'
                    : 'text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200'
                }`}
              >
                {activeVariant.stock > 0
                  ? `In Stock (${activeVariant.stock} available)`
                  : 'Out of Stock in this size'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {sizesForColour.map((v) => {
              const isSelected = activeVariant?.id === v.id;
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
                  className={`p-3 rounded-2xl border text-center transition-all relative ${
                    isSelected
                      ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black ring-2 ring-emerald-600/30 shadow-xs'
                      : outOfStock
                      ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-50 line-through'
                      : 'border-stone-200 bg-white hover:border-stone-400 text-slate-800 font-bold hover:bg-stone-50'
                  }`}
                >
                  <span className="block text-sm sm:text-base font-extrabold">{v.size}</span>
                  <span className="block text-[10px] mt-0.5 font-semibold opacity-75">
                    {outOfStock ? 'Sold Out' : `${v.stock} left`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Quantity Stepper */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-800 block">3. Quantity:</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-stone-300 rounded-2xl overflow-hidden bg-stone-50 shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="p-3 text-slate-700 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={15} />
              </button>
              <span className="w-12 text-center text-sm font-black text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                disabled={quantity >= maxStock || isOutOfStock}
                className="p-3 text-slate-700 hover:bg-stone-200 disabled:opacity-30 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={15} />
              </button>
            </div>
            <div className="text-xs text-slate-600">
              Total: <strong className="text-slate-900 font-black text-sm">{formatPrice(effectivePrice * quantity)}</strong>
            </div>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full py-4 bg-slate-950 hover:bg-slate-800 active:bg-black text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? 'Sold Out in Selected Combination' : 'Add to Shopping Bag'}</span>
          </button>

          {/* Direct WhatsApp Instant Order Button */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello AR Fashion House, I want to confirm order for "${product.name}" (Colour: ${selectedColour}, Size: ${activeVariant?.size || 'Standard'}, Qty: ${quantity}). Please confirm delivery address.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={18} />
            <span>Order Directly via WhatsApp</span>
          </a>
        </div>

        {/* Benefits Highlights */}
        <div className="border-t border-stone-100 pt-5 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Truck size={16} className="text-emerald-700 shrink-0" />
            <span>Fast Express Dispatch: 24-48 hrs in Dhaka; 2-4 days nationwide.</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
            <span>7-Day Replacement Guarantee if garment sizing needs adjustment.</span>
          </div>
        </div>

        {/* Fabric & Care */}
        <div className="border-t border-stone-100 pt-5 space-y-2">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Fabric & Craftsmanship Details
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
            {product.description || 'Masterpiece clothing tailored by AR Fashion House.'}
          </p>
        </div>
      </div>
    </div>
  );
}
