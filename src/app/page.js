import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import {
  ArrowRight,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Truck,
  MessageSquare,
  Star,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch real database content
  const [settings, content, categories, featuredProducts, newArrivals] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: { _count: { select: { products: { where: { status: 'PUBLISHED' } } } } },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', isFeatured: true },
      take: 8,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.findMany({
      where: { status: 'PUBLISHED', isNewArrival: true },
      take: 8,
      include: { category: true, variants: true },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const currencySymbol = settings?.currencySymbol || '₹';
  const waPhone = settings?.primaryPhone || '+917304396709';
  const cleanPhone = waPhone.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1">
        {/* 1. High-Fashion Hero Showcase Section */}
        <section className="relative overflow-hidden bg-slate-950 text-white min-h-[560px] sm:min-h-[620px] flex items-center">
          {/* Hero background image with dark overlay */}
          {content?.heroImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={content.heroImage}
                alt="AR Fashion Showcase"
                className="w-full h-full object-cover object-center opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
            <div className="max-w-2xl space-y-6">
              {/* Luxury Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={13} className="text-amber-400" />
                <span>Haute Couture & Festive Collection 2026</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                {content?.heroHeading || 'Elegance Reimagined for Every Celebration'}
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl font-normal">
                {content?.heroSubheading ||
                  'Explore hand-crafted Panjabis, Banarasi Silks, and Contemporary Kurtis made with pure organic fabrics and tailored for supreme perfection.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={content?.heroPrimaryBtnLink || '/shop'}
                  className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-950/50 transition-all flex items-center gap-2 group"
                >
                  <span>{content?.heroPrimaryBtnText || 'Explore Collection'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={content?.heroSecondaryBtnLink || '#categories'}
                  className="px-7 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xs transition-all border border-white/20"
                >
                  {content?.heroSecondaryBtnText || 'Browse Categories'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Value Propositions Bar */}
        <section className="bg-white border-b border-stone-200/90 py-7">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Nationwide Express Delivery</h4>
                <p className="text-[11px] text-slate-500">
                  Free delivery on orders over {formatPrice(settings?.freeShippingThreshold ?? 2000, currencySymbol)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">Direct WhatsApp Ordering</h4>
                <p className="text-[11px] text-slate-500">Fast human confirmation & care</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">100% Quality Fabrics</h4>
                <p className="text-[11px] text-slate-500">Fine silk, linen & combed cotton</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">7-Day Easy Exchange</h4>
                <p className="text-[11px] text-slate-500">Hassle-free size replacement</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Category Showcase Grid */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Curated Collections
              </span>
              <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-2">
                Explore by Outfit Collection
              </h2>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
            >
              <span>View All Outfits</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-stone-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-stone-100 relative">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400 text-xs font-bold">
                      {cat.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-serif-luxury font-bold text-sm sm:text-base leading-snug drop-shadow-xs">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    {cat._count?.products || 0} Pieces Available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-white py-16 sm:py-20 border-y border-stone-200/90">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-500 text-amber-500" />
                    <span>Selected Creations</span>
                  </span>
                  <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-2">
                    Featured Masterpieces
                  </h2>
                </div>
                <Link
                  href="/shop?filter=featured"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                >
                  <span>See All Featured</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
                {featuredProducts.map((prod) => {
                  const totalStock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  const isOutOfStock = totalStock <= 0;
                  const uniqueColours = [...new Set(prod.variants.map((v) => v.colourCode || '#1E293B'))].slice(0, 4);

                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                            No Photo
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {prod.isNewArrival && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-xs">
                              NEW
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-xs">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                            {prod.category?.name}
                          </span>
                          <h3 className="font-serif-luxury font-bold text-slate-900 text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                            {prod.name}
                          </h3>

                          {/* Colour dots indicator on card */}
                          {uniqueColours.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {uniqueColours.map((code, idx) => (
                                <span
                                  key={idx}
                                  className="w-3 h-3 rounded-full border border-black/20"
                                  style={{ backgroundColor: code }}
                                />
                              ))}
                              {prod.variants.length > 4 && (
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  +{prod.variants.length - 4} shades
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-stone-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-base sm:text-lg font-black text-slate-900 font-serif-luxury">
                              {formatPrice(prod.sellingPrice, currencySymbol)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                              <span className="text-xs text-slate-400 line-through ml-1.5">
                                {formatPrice(prod.originalPrice, currencySymbol)}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                            Select Size &rarr;
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Just Dropped
                </span>
                <h2 className="font-serif-luxury text-2xl sm:text-4xl font-black text-slate-950 tracking-tight mt-2">
                  New Arrivals 2026
                </h2>
              </div>
              <Link
                href="/shop?filter=new"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <span>View All New Arrivals</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {newArrivals.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-stone-100 relative">
                    {prod.mainImage && (
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {prod.category?.name}
                      </span>
                      <h3 className="font-serif-luxury font-bold text-slate-900 text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="pt-3 mt-3 border-t border-stone-100 flex items-baseline justify-between">
                      <span className="text-base sm:text-lg font-black text-slate-900 font-serif-luxury">
                        {formatPrice(prod.sellingPrice, currencySymbol)}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 group-hover:underline">
                        Order &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Brand Story Section */}
        <section id="about" className="bg-[#0B132B] text-white py-20 lg:py-24 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest">
                Our Heritage & Craft
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {content?.brandStoryTitle || 'Authentic Craftsmanship & Modern Elegance'}
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
                {content?.brandStoryText ||
                  'At AR Fashion House, we celebrate the deep heritage of Bengal weaving, intricate zardozi needlework, and modern precision tailoring. Every piece in our boutique is individually inspected for seam integrity and fabric longevity.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs transition-colors shadow-lg shadow-emerald-950/50"
                >
                  Shop the Boutique
                </Link>
                <Link
                  href="/policies/shipping-policy"
                  className="px-6 py-3.5 border border-slate-700 text-slate-300 hover:text-white rounded-2xl text-xs transition-colors"
                >
                  Shipping & Coverage
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
                {content?.brandStoryImage ? (
                  <img
                    src={content.brandStoryImage}
                    alt="Brand Heritage"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                    AR Fashion House Atelier
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
