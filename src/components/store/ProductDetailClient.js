'use client';
import { useState, useMemo } from 'react';
import { useCart } from './CartContext';
import {
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  Minus,
  Plus,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function ProductDetailClient({ product, settings }) {
  const { addToCart, setDrawerOpen } = useCart();

  // Images Gallery state
  const allImages = useMemo(() => {
    const list = product.images?.map((img) => (typeof img === 'string' ? img : img.url)) || [];
    if (product.mainImage && !list.includes(product.mainImage)) {
      list.unshift(product.mainImage);
    }
    return list.length > 0 ? list : ['/uploads/placeholder.jpg'];
  }, [product]);

  const [activeImage, setActiveImage] = useState(allImages[0]);

  // Unique colours available in variants
  const availableColours = useMemo(() => {
    const map = new Map();
    product.variants.forEach((v) => {
      if (!map.has(v.colour)) {
        map.set(v.colour, { name: v.colour, code: v.colourCode || '#1E293B' });
      }
    });
    return Array.from(map.values());
  }, [product.variants]);

  // Selected Colour state
  const [selectedColour, setSelectedColour] = useState(
    availableColours[0]?.name || ''
  );

  // Available sizes under the selected colour
  const sizesForColour = useMemo(() => {
    return product.variants.filter((v) => v.colour === selectedColour);
  }, [product.variants, selectedColour]);

  // Selected Variant state
  const [selectedVariantId, setSelectedVariantId] = useState(
    sizesForColour[0]?.id || ''
  );

  // When selectedColour changes, update selectedVariantId to the first available in that colour
  const handleColourChange = (cName) => {
    setSelectedColour(cName);
    const firstInColour = product.variants.find((v) => v.colour === cName);
    if (firstInColour) {
      setSelectedVariantId(firstInColour.id);
      setQuantity(1);
    }
  };

  // Currently selected variant object
  const activeVariant = useMemo(() => {
    return product.variants.find((v) => v.id === selectedVariantId) || sizesForColour[0] || null;
  }, [product.variants, selectedVariantId, sizesForColour]);

  // Quantity state
  const [quantity, setQuantity] = useState(1);

  // Effective price
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* 1. Images Gallery Showcase */}
      <div className="space-y-4">
        {/* Main Display Photo */}
        <div className="aspect-[3/4] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/90 shadow-sm relative group">
          <img
            src={activeImage}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {product.isNewArrival && (
            <div className="absolute top-4 left-4 bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              New Arrival
            </div>
          )}
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
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 scale-105'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Information & Variant Selector */}
      <div className="space-y-6">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
            {product.category?.name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {product.name}
          </h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            SKU: <strong className="text-slate-700">{activeVariant?.sku || product.sku}</strong>
          </p>
        </div>

        {/* Price display */}
        <div className="flex items-baseline gap-3 pb-2 border-b border-slate-100">
          <span className="text-3xl sm:text-4xl font-black text-slate-900">
            {formatPrice(effectivePrice)}
          </span>
          {product.originalPrice && product.originalPrice > effectivePrice && (
            <>
              <span className="text-lg text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                Save {formatPrice(product.originalPrice - effectivePrice)}
              </span>
            </>
          )}
        </div>

        {/* 1. Colour Selection */}
        {availableColours.length > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-800">
                Colour: <strong className="text-emerald-700">{selectedColour}</strong>
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {availableColours.map((col) => {
                const isSelected = selectedColour === col.name;
                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => handleColourChange(col.name)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: col.code }}
                    />
                    <span>{col.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Size Selection for Chosen Colour */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-800">Select Available Size:</span>
            {activeVariant && (
              <span
                className={`text-[11px] font-bold ${
                  activeVariant.stock > 5
                    ? 'text-emerald-700'
                    : activeVariant.stock > 0
                    ? 'text-amber-700'
                    : 'text-rose-600'
                }`}
              >
                {activeVariant.stock > 0
                  ? `In Stock (${activeVariant.stock} left)`
                  : 'Sold Out'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {sizesForColour.map((v) => {
              const isSelected = activeVariant?.id === v.id;
              const outOfStock = v.stock <= 0;

              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setSelectedVariantId(v.id);
                    setQuantity(1);
                  }}
                  className={`p-3 rounded-2xl border text-center transition-all relative ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20'
                      : outOfStock
                      ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 font-bold'
                  }`}
                >
                  <span className="block text-sm">{v.size}</span>
                  <span className="block text-[10px] mt-0.5 opacity-80">
                    {outOfStock ? 'Out of stock' : `${v.stock} in stock`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Quantity Stepper */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-800 block">Quantity:</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1 || isOutOfStock}
                className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
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
                className="p-3 text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <Plus size={15} />
              </button>
            </div>
            <span className="text-xs text-slate-500">
              Total: <strong>{formatPrice(effectivePrice * quantity)}</strong>
            </span>
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Buy via WhatsApp */}
        <div className="space-y-3 pt-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-black text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingBag size={18} />
            <span>{isOutOfStock ? 'Currently Out of Stock' : 'Add to Shopping Cart'}</span>
          </button>

          {/* Direct WhatsApp Quick Inquire Link */}
          <a
            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello AR Fashion House, I want to order "${product.name}" (Colour: ${selectedColour}, Size: ${activeVariant?.size || 'Standard'}, Qty: ${quantity}). Please confirm availability.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            <MessageSquare size={18} />
            <span>Order Quickly via WhatsApp</span>
          </a>
        </div>

        {/* Highlights */}
        <div className="border-t border-slate-200/90 pt-6 space-y-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <Truck size={16} className="text-emerald-600" />
            <span>Delivery within 24-48 hours in Dhaka; 2-4 days nationwide.</span>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>7-day replacement guarantee if size does not fit.</span>
          </div>
        </div>

        {/* Description & Care */}
        <div className="border-t border-slate-200/90 pt-6 space-y-3">
          <h4 className="text-sm font-bold text-slate-900">Product Description & Fabric Details</h4>
          <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line space-y-2">
            {product.description || 'Premium quality apparel from AR Fashion House.'}
          </div>
        </div>
      </div>
    </div>
  );
}
