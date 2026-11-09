import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ProductDetailClient from '@/components/store/ProductDetailClient';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { Crown } from 'lucide-react';

export async function generateMetadata({ params }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, mainImage: true },
  });

  if (!product) return { title: 'Product Not Found | AR Fashion House' };

  return {
    title: `${product.name} | AR Fashion House`,
    description: product.description?.slice(0, 160) || 'Shop online at AR Fashion House.',
    openGraph: {
      images: product.mainImage ? [product.mainImage] : [],
    },
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({ params }) {
  const [settings, content, product, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
      },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  // Draft products must remain hidden from customers!
  if (!product || product.status !== 'PUBLISHED') {
    notFound();
  }

  const currencySymbol = settings?.currencySymbol || '₹';

  // Related products from same category
  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'PUBLISHED',
      id: { not: product.id },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-stone-400 font-medium">
          <Link href="/" className="hover:text-amber-300 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-amber-300 transition-colors">
            Catalog
          </Link>
          <span>/</span>
          <Link
            href={`/shop?category=${product.category?.slug}`}
            className="hover:text-amber-300 capitalize transition-colors"
          >
            {product.category?.name}
          </Link>
          <span>/</span>
          <span className="text-amber-400 font-bold truncate max-w-xs">{product.name}</span>
        </div>

        {/* Interactive Client PDP */}
        <ProductDetailClient product={product} settings={settings} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-amber-500/20 pt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-royal-title text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Complementary Creations</span>
                <Crown size={18} className="text-amber-400" />
              </h3>
              <Link
                href={`/shop?category=${product.category?.slug}`}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider"
              >
                View Category &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  className="group bg-[#0E0E14] rounded-3xl overflow-hidden border border-amber-500/20 shadow-md hover:border-amber-400/70 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-stone-900">
                    {p.mainImage && (
                      <img
                        src={p.mainImage}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h4 className="font-serif-luxury font-bold text-stone-100 text-xs sm:text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {p.name}
                    </h4>
                    <p className="font-black text-amber-400 text-sm mt-2 font-serif-luxury">
                      {formatPrice(p.sellingPrice, currencySymbol)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
