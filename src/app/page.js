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
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export const revalidate = 0; // Always fresh database data

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <StoreHeader settings={settings} content={content} />

      <main className="flex-1">
        {/* 1. Hero Showcase Section */}
        <section className="relative overflow-hidden bg-slate-950 text-white min-h-[520px] flex items-center">
          {/* Hero background image */}
          {content?.heroImage && (
            <div className="absolute inset-0 z-0">
              <img
                src={content.heroImage}
                alt="AR Fashion Showcase"
                className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 animate-in fade-in">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Official 2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1] mb-5">
              {content?.heroHeading || 'Elevate Your Style with AR Fashion'}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-8 max-w-xl font-normal">
              {content?.heroSubheading ||
                'Discover premium hand-crafted traditional & contemporary clothing tailored for perfection across Bangladesh.'}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={content?.heroPrimaryBtnLink || '/shop'}
                className="px-7 py-3.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-emerald-900/40 transition-all flex items-center gap-2"
              >
                <span>{content?.heroPrimaryBtnText || 'Explore Collection'}</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                href={content?.heroSecondaryBtnLink || '#categories'}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm backdrop-blur-xs transition-all border border-white/20"
              >
                {content?.heroSecondaryBtnText || 'Browse Categories'}
              </Link>
            </div>
          </div>
        </section>

        {/* 2. Value Propositions Bar */}
        <section className="bg-white border-b border-slate-200/80 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Nationwide Express Delivery</h4>
                <p className="text-[11px] text-slate-500">Free delivery on orders over ৳2000</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Direct WhatsApp Ordering</h4>
                <p className="text-[11px] text-slate-500">Fast human confirmation & care</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Quality Fabrics</h4>
                <p className="text-[11px] text-slate-500">Fine cotton, pure silk, rich linen</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">7-Day Easy Exchange</h4>
                <p className="text-[11px] text-slate-500">Hassle-free size replacement</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Category Showcase Grid */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
                Curated Categories
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Explore by Outfit Collection
              </h2>
            </div>
            <Link
              href="/shop"
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
            >
              <span>View All Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/shop?category=${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100 relative">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 text-xs font-bold">
                      {cat.name}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80" />
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 text-white">
                  <h3 className="font-extrabold text-sm sm:text-base leading-snug drop-shadow-xs">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-semibold mt-0.5">
                    {cat._count?.products || 0} Products
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="bg-white py-16 border-y border-slate-200/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
                <div>
                  <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Star size={14} className="fill-emerald-600 text-emerald-600" />
                    <span>Top Picks</span>
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                    Featured Creations
                  </h2>
                </div>
                <Link
                  href="/shop?filter=featured"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                >
                  <span>See All Featured</span>
                  <ArrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {featuredProducts.map((prod) => {
                  const totalStock = prod.variants.reduce((s, v) => s + (v.stock || 0), 0);
                  const isOutOfStock = totalStock <= 0;

                  return (
                    <Link
                      key={prod.id}
                      href={`/product/${prod.slug}`}
                      className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                    >
                      <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100 relative">
                        {prod.mainImage ? (
                          <img
                            src={prod.mainImage}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
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

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            {prod.category?.name}
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                            {prod.name}
                          </h3>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <span className="text-base font-black text-slate-900">
                              {formatPrice(prod.sellingPrice)}
                            </span>
                            {prod.originalPrice && prod.originalPrice > prod.sellingPrice && (
                              <span className="text-xs text-slate-400 line-through ml-1.5">
                                {formatPrice(prod.originalPrice)}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-emerald-600 group-hover:underline">
                            View Details
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
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest">
                  Just Dropped
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  New Arrivals 2026
                </h2>
              </div>
              <Link
                href="/shop?filter=new"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
              >
                <span>View All New Arrivals</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/product/${prod.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-slate-100 relative">
                    {prod.mainImage && (
                      <img
                        src={prod.mainImage}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {prod.category?.name}
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-0.5 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-base font-black text-slate-900">
                        {formatPrice(prod.sellingPrice)}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 group-hover:underline">
                        Order
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 6. Brand Story Section */}
        <section id="about" className="bg-[#0F172A] text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-widest">
                Our Heritage & Craft
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {content?.brandStoryTitle || 'Authentic Craftsmanship & Modern Elegance'}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed font-normal">
                {content?.brandStoryText ||
                  'At AR Fashion House, we celebrate the deep heritage of Bengal weaving, intricate zardozi needlework, and modern precision tailoring. Every piece in our boutique is individually inspected for seam integrity and fabric longevity.'}
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-900/30"
                >
                  Shop the Boutique
                </Link>
                <Link
                  href="/policies/shipping-policy"
                  className="px-6 py-3 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs transition-colors"
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
