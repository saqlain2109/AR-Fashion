import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';
    const newArrival = searchParams.get('newArrival') === 'true';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const size = searchParams.get('size');
    const colour = searchParams.get('colour');
    const inStock = searchParams.get('inStock') === 'true';

    // Base filter
    const where = {};

    // Customer-facing restriction: draft products must remain hidden from customers!
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (searchParams.get('status')) {
      where.status = searchParams.get('status');
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (featured) {
      where.isFeatured = true;
    }

    if (newArrival) {
      where.isNewArrival = true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.sellingPrice = {};
      if (minPrice) where.sellingPrice.gte = parseFloat(minPrice);
      if (maxPrice) where.sellingPrice.lte = parseFloat(maxPrice);
    }

    // Filter by variant attributes
    if (size || colour || inStock) {
      const variantWhere = {};
      if (size) variantWhere.size = size;
      if (colour) variantWhere.colour = colour;
      if (inStock) variantWhere.stock = { gt: 0 };
      where.variants = { some: variantWhere };
    }

    // Sorting
    let orderBy = { createdAt: 'desc' };
    if (sort === 'price_asc') {
      orderBy = { sellingPrice: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { sellingPrice: 'desc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
      },
    });

    // Add aggregate stock count to each product
    const enrichedProducts = products.map(product => {
      const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
      return {
        ...product,
        totalStock,
      };
    });

    return NextResponse.json({ success: true, products: enrichedProducts });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      sku,
      sellingPrice,
      originalPrice,
      status = 'DRAFT',
      isFeatured = false,
      isNewArrival = false,
      mainImage,
      images = [],
      variants = [],
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'Category is required.' }, { status: 400 });
    }
    if (!sku || !sku.trim()) {
      return NextResponse.json({ error: 'SKU / Product Code is required.' }, { status: 400 });
    }
    if (sellingPrice === undefined || sellingPrice === null || isNaN(sellingPrice) || Number(sellingPrice) < 0) {
      return NextResponse.json({ error: 'A valid Selling Price is required.' }, { status: 400 });
    }

    // Verify SKU uniqueness
    const existingSku = await prisma.product.findUnique({ where: { sku: sku.trim().toUpperCase() } });
    if (existingSku) {
      return NextResponse.json({ error: `SKU "${sku.trim().toUpperCase()}" is already in use by another product.` }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(name);
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Determine primary image
    const primaryImg = typeof mainImage === 'string' && mainImage.trim() !== ''
      ? mainImage.trim()
      : (images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0]?.url) : null);

    // Save product, images and variants in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          description: description?.trim() || '',
          categoryId,
          sku: sku.trim().toUpperCase(),
          sellingPrice: parseFloat(sellingPrice),
          originalPrice: originalPrice ? parseFloat(originalPrice) : null,
          status: status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT',
          isFeatured: Boolean(isFeatured),
          isNewArrival: Boolean(isNewArrival),
          mainImage: primaryImg,
        },
      });

      // Insert product photos
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          const imgUrl = typeof item === 'string' ? item : item.url;
          const imgColour = typeof item === 'object' && item.colour ? item.colour.trim() : null;
          await tx.productImage.create({
            data: {
              productId: created.id,
              url: imgUrl,
              colour: imgColour,
              displayOrder: i,
              isMain: imgUrl === primaryImg || i === 0,
            },
          });
        }
      }

      // Insert size & colour variants with stock
      if (variants && variants.length > 0) {
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: created.id,
              colour: v.colour?.trim() || 'Standard',
              colourCode: v.colourCode || '#1E293B',
              size: v.size?.trim() || 'Standard',
              stock: parseInt(v.stock, 10) || 0,
              price: v.price ? parseFloat(v.price) : null,
              sku: v.sku || `${created.sku}-${(v.colour || 'STD').substring(0, 3).toUpperCase()}-${(v.size || 'STD').replace(/\s+/g, '')}`,
            },
          });
        }
      } else {
        // If no variants provided, create default standard variant
        await tx.productVariant.create({
          data: {
            productId: created.id,
            colour: 'Standard',
            colourCode: '#1E293B',
            size: 'Standard',
            stock: 0,
            sku: `${created.sku}-STD`,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: created.id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          variants: true,
        },
      });
    });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {}

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create product' }, { status: 500 });
  }
}
