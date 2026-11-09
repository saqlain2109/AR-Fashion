import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import StoreImage from '@/components/ui/StoreImage';
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
  Crown,
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
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1">
        {/* 1. High-Fashion Royal Hero Showcase Section */}
        <section className="relative overflow-hidden bg-[#060608] min-h-[580px] sm:min-h-[640px] flex items-center border-b border-amber-500/20">
          {/* Subtle gold ambient glow in background */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

          {/* Hero background image with dark overlay */}
          {content?.heroImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={content.heroImage}
                alt="AR Fashion House Showcase"
                className="w-full h-full object-cover object-center opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#060608] via-[#060608]/90 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 w-full">
            <div className="max-w-2xl space-y-6">
              {/* Royal Badge with Crown */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-sm">
                <Crown size={14} className="text-amber-400 shrink-0 drop-shadow-[0_0_8px_rgba(212,175,55,0.7)]" />
                <span className="truncate">{settings?.businessName || 'AR Fashion House'} &bull; Royal Atelier 2026</span>
              </div>

              {/* Tagline Cursive Badge from Logo */}
              <div className="font-royal-script text-xl sm:text-2xl lg:text-3xl text-amber-300 font-normal tracking-wide">
                Your Style Our Passion
              </div>

              {/* Main Headline */}
              <h1 className="font-royal-title text-2xl sm:text-4xl lg:text-6xl font-black tracking-tight text-white leading-[1.2] drop-shadow-md">
                {content?.heroHeading || 'Royal Haute Couture & Timeless Ethnic Elegance'}
              </h1>

              {/* Subheading */}
              <p className="text-xs sm:text-sm lg:text-base text-stone-300 leading-relaxed max-w-xl font-normal">
                {content?.heroSubheading ||
                  'Experience handcrafted masterworks adorned with fine zari embroidery and pure handwoven silks. Designed for those who demand nothing less than royalty.'}
              </p>

              {/* CTAs - Mobile Responsive Full Width or Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                <Link
                  href={content?.heroPrimaryBtnLink || '/shop'}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 gold-gradient-btn text-black font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 group tracking-wider uppercase text-center"
                >
                  <span>{content?.heroPrimaryBtnText || 'Explore Royal Collection'}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href={content?.heroSecondaryBtnLink || '#categories'}
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 bg-white/5 hover:bg-white/10 text-stone-200 hover:text-amber-300 font-bold rounded-2xl text-xs sm:text-sm backdrop-blur-xs transition-all border border-amber-500/30 hover:border-amber-400 tracking-wider uppercase text-center"
                >
                  {content?.heroSecondaryBtnText || 'Browse Collections'}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Value Propositions Bar (Luxury Glass Cards - 100% Mobile Responsive) */}
        <section className="bg-[#0A0A0F] border-b border-amber-500/20 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/3 border border-amber-500/15">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Crown size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">Royal Haute Couture</h4>
                <p className="text-[11px] text-stone-400 truncate">Intricate zari & pure handloom silks</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/3 border border-amber-500/15">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Truck size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">All-India Express Delivery</h4>
                <p className="text-[11px] text-stone-400 truncate">
                  Complimentary on {formatPrice(settings?.freeShippingThreshold ?? 2000, currencySymbol)}+
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/3 border border-amber-500/15">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">WhatsApp Concierge</h4>
                <p className="text-[11px] text-stone-400 truncate">Direct styling & instant ordering</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/3 border border-amber-500/15">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate">7-Day Royal Exchange</h4>
                <p className="text-[11px] text-stone-400 truncate">Hassle-free size replacement</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Category Showcase Grid */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/30 inline-flex items-center gap-1.5">
                <Crown size={12} className="text-amber-400" />
                <span>Curated Collections</span>
              </span>
              <h2 className="font-royal-title text-2xl sm:text-4xl font-black text-white tracking-tight mt-2">
                Explore by Outfit Collection
              </h2>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors tracking-wide uppercase"
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
                className="group relative rounded-3xl overflow-hidden bg-[#0E0E14] border border-amber-500/20 shadow-lg hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-stone-900 relative">
                  {cat.image ? (
                    <StoreImage
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-900 text-amber-400/60 text-xs font-bold font-royal-title">
                      {cat.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/40 to-transparent" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-serif-luxury font-bold text-sm sm:text-base leading-snug drop-shadow-md text-stone-100 group-hover:text-amber-300 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-semibold mt-0.5">
                    {cat._count?.products || 0} Pieces Available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Masterpieces Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-[#09090E] py-16 sm:py-20 border-y border-amber-500/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>Royal Masterpieces</span>
                  </span>
                  <h2 className="font-royal-title text-2xl sm:text-4xl font-black text-white tracking-tight mt-2">
                    Featured Haute Couture
                  </h2>
                </div>
                <Link
                  href="/shop?filter=featured"
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors tracking-wide uppercase"
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
                      className="group bg-[#0E0E14] rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
                        {prod.mainImage ? (
                          <StoreImage
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-500 text-xs">
                            No Photo
                          </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-1">
                          {prod.isNewArrival && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-black text-amber-400 border border-amber-500/40 shadow-xs">
                              NEW
                            </span>
                          )}
                          {isOutOfStock && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950 text-rose-300 border border-rose-800 shadow-xs">
                              Sold Out
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                            {prod.category?.name}
                          </span>
                          <h3 className="font-serif-luxury font-bold text-stone-100 text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                            {prod.name}
                          </h3>

                          {/* Colour dots indicator on card */}
                          {uniqueColours.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {uniqueColours.map((code, idx) => (
                                <span
                                  key={idx}
                                  className="w-3 h-3 rounded-full border border-white/20"
                                  style={{ backgroundColor: code }}
                                />
                              ))}
                              {prod.variants.length > 4 && (
                                <span className="text-[10px] text-stone-500 font-semibold">
                                  +{prod.variants.length - 4} shades
                                </span>
                              )}
                            </div>
                          )}
                        </div>

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
            </div>
          </section>
        )}

        {/* 5. New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-md border border-amber-500/30 inline-flex items-center gap-1.5">
                  <Crown size={12} className="text-amber-400" />
                  <span>Just Dropped</span>
                </span>
                <h2 className="font-royal-title text-2xl sm:text-4xl font-black text-white tracking-tight mt-2">
                  New Arrivals 2026
                </h2>
              </div>
              <Link
                href="/shop?filter=new"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors tracking-wide uppercase"
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
                  className="group bg-[#0E0E14] rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900 relative">
                    {prod.mainImage && (
                      <StoreImage
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest">
                        {prod.category?.name}
                      </span>
                      <h3 className="font-serif-luxury font-bold text-stone-100 text-sm sm:text-base mt-1 line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="text-xs sm:text-base font-black text-amber-400 font-serif-luxury">
                        {formatPrice(prod.sellingPrice, currencySymbol)}
                      </span>
                      <span className="text-[9px] sm:text-[11px] font-extrabold gold-gradient-btn px-2 py-0.5 rounded-md self-start sm:self-auto shrink-0">
                        View Piece &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Brand Story & Atelier Heritage Section */}
        <section id="about" className="bg-[#050508] text-white py-20 lg:py-24 border-t border-amber-500/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Crown size={14} className="text-amber-400" />
                <span>Our Heritage & Atelier</span>
              </span>
              <div className="font-royal-script text-2xl sm:text-3xl text-amber-300 font-normal">
                Your Style Our Passion
              </div>
              <h2 className="font-royal-title text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {content?.brandStoryTitle || 'Royalty in Every Thread — Handcrafted Perfection'}
              </h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-normal">
                {content?.brandStoryText ||
                  `At ${settings?.businessName || 'AR Fashion House'}, we celebrate authentic craftsmanship, exquisite needlework, and modern precision tailoring. Every piece in our boutique is individually inspected for seam integrity and fabric longevity.`}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-7 py-3.5 gold-gradient-btn font-extrabold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20"
                >
                  Shop the Boutique
                </Link>
                <Link
                  href="/policies/shipping-policy"
                  className="px-6 py-3.5 border border-amber-500/30 text-stone-300 hover:text-amber-300 hover:border-amber-400 rounded-2xl text-xs transition-colors uppercase tracking-wider"
                >
                  Shipping & Coverage
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl bg-[#0E0E14] relative group">
                {content?.brandStoryImage ? (
                  <img
                    src={content.brandStoryImage}
                    alt="Brand Heritage"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <Crown size={40} className="text-amber-400" />
                    <span className="font-royal-title text-amber-300 font-bold text-lg">
                      {settings?.businessName || 'AR Fashion House'} Atelier
                    </span>
                    <span className="font-royal-script text-amber-400 text-lg">
                      Your Style Our Passion
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060608]/70 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
