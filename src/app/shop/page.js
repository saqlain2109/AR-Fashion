import { prisma } from '@/lib/prisma';
import StoreHeader from '@/components/store/StoreHeader';
import StoreFooter from '@/components/store/StoreFooter';
import ShopCatalogClient from '@/components/store/ShopCatalogClient';
import Link from 'next/link';
import { Crown } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage({ searchParams }) {
  const categorySlug = searchParams?.category;
  const searchQuery = searchParams?.search || '';
  const sort = searchParams?.sort || 'newest';
  const sizeFilter = searchParams?.size;
  const colourFilter = searchParams?.colour;
  const inStockOnly = searchParams?.inStock === 'true';
  const filterType = searchParams?.filter; // 'featured', 'new'

  // Fetch settings & content
  const [settings, content, categories] = await Promise.all([
    prisma.storeSettings.findUnique({ where: { id: 'default' } }),
    prisma.websiteContent.findUnique({ where: { id: 'default' } }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ]);

  const currencySymbol = settings?.currencySymbol || '₹';

  // Build Prisma where
  const where = {
    status: 'PUBLISHED',
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (filterType === 'featured') {
    where.isFeatured = true;
  } else if (filterType === 'new') {
    where.isNewArrival = true;
  }

  if (searchQuery.trim()) {
    where.OR = [
      { name: { contains: searchQuery.trim() } },
      { description: { contains: searchQuery.trim() } },
      { sku: { contains: searchQuery.trim() } },
    ];
  }

  if (sizeFilter || colourFilter || inStockOnly) {
    const variantWhere = {};
    if (sizeFilter) variantWhere.size = sizeFilter;
    if (colourFilter) variantWhere.colour = colourFilter;
    if (inStockOnly) variantWhere.stock = { gt: 0 };
    where.variants = { some: variantWhere };
  }

  let orderBy = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
  else if (sort === 'oldest') orderBy = { createdAt: 'asc' };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      variants: true,
      images: true,
    },
  });

  // Extract all unique sizes and colours from categories for filter drawer
  const allVariants = await prisma.productVariant.findMany({
    where: { product: { status: 'PUBLISHED' } },
    select: { size: true, colour: true, colourCode: true },
  });

  const availableSizes = [...new Set(allVariants.map((v) => v.size).filter(Boolean))];
  const availableColours = [...new Set(allVariants.map((v) => v.colour).filter(Boolean))];

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-stone-100 overflow-x-hidden">
      <StoreHeader categories={categories} settings={settings} content={content} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-stone-400 font-medium mb-1.5">
            <Link href="/" className="hover:text-amber-300 transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-300 font-bold">Catalog</span>
            {categorySlug && (
              <>
                <span>/</span>
                <span className="text-amber-400 font-bold capitalize">
                  {categorySlug.replace(/-/g, ' ')}
                </span>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h1 className="font-royal-title text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>
                {categorySlug
                  ? categories.find((c) => c.slug === categorySlug)?.name || 'Collection'
                  : filterType === 'featured'
                  ? 'Featured Highlights'
                  : filterType === 'new'
                  ? 'New Arrivals 2026'
                  : 'All Outfits & Collections'}
              </span>
              <Crown size={20} className="text-amber-400 hidden sm:inline" />
            </h1>
            <p className="text-xs text-stone-400">
              Showing <strong className="text-amber-400 font-bold">{products.length}</strong> available outfit(s)
            </p>
          </div>
        </div>

        {/* Dynamic Catalog with Slide-over Filter Drawer & Product Grid */}
        <ShopCatalogClient
          products={products}
          categories={categories}
          availableSizes={availableSizes}
          availableColours={availableColours}
          allVariants={allVariants}
          currencySymbol={currencySymbol}
          categorySlug={categorySlug}
          searchQuery={searchQuery}
          sort={sort}
          sizeFilter={sizeFilter}
          colourFilter={colourFilter}
          inStockOnly={inStockOnly}
          filterType={filterType}
        />
      </main>

      <StoreFooter settings={settings} />
    </div>
  );
}
