import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const isAdmin = searchParams.get('admin') === 'true';

    // Can find by ID or Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        category: true,
        images: { orderBy: { displayOrder: 'asc' } },
        variants: { orderBy: { size: 'asc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!isAdmin && product.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Product is not available' }, { status: 404 });
    }

    const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

    return NextResponse.json({
      success: true,
      product: { ...product, totalStock },
    });
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { variants: true, images: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Quick status toggle or full update
    if (body.toggleStatusOnly) {
      const newStatus = existing.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updated = await prisma.product.update({
        where: { id },
        data: { status: newStatus },
      });
      return NextResponse.json({ success: true, product: updated });
    }

    const {
      name,
      description,
      categoryId,
      sku,
      sellingPrice,
      originalPrice,
      status,
      isFeatured,
      isNewArrival,
      mainImage,
      images,
      variants,
    } = body;

    // Check SKU if changed
    if (sku && sku.trim().toUpperCase() !== existing.sku) {
      const duplicateSku = await prisma.product.findFirst({
        where: { sku: sku.trim().toUpperCase(), id: { not: id } },
      });
      if (duplicateSku) {
        return NextResponse.json({ error: `SKU "${sku}" is already in use by another product.` }, { status: 400 });
      }
    }

    // Slug check if name changed
    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      slug = slugify(name);
      const duplicateSlug = await prisma.product.findFirst({
        where: { slug, id: { not: id } },
      });
      if (duplicateSlug) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const primaryImg = mainImage || (images && images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : existing.mainImage);

    // Update in transaction
    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1. Update basic product data
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: name ? name.trim() : existing.name,
          slug,
          description: description !== undefined ? description?.trim() : existing.description,
          categoryId: categoryId || existing.categoryId,
          sku: sku ? sku.trim().toUpperCase() : existing.sku,
          sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : existing.sellingPrice,
          originalPrice: originalPrice !== undefined ? (originalPrice ? parseFloat(originalPrice) : null) : existing.originalPrice,
          status: status || existing.status,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
          isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : existing.isNewArrival,
          mainImage: primaryImg,
        },
      });

      // 2. Update images if provided
      if (Array.isArray(images)) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          const imgUrl = typeof item === 'string' ? item : item.url;
          const imgColour = typeof item === 'object' && item.colour ? item.colour.trim() : null;
          await tx.productImage.create({
            data: {
              productId: id,
              url: imgUrl,
              colour: imgColour,
              displayOrder: i,
              isMain: imgUrl === primaryImg || i === 0,
            },
          });
        }
      }

      // 3. Update variants if provided
      if (Array.isArray(variants)) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        for (const v of variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              colour: v.colour?.trim() || 'Standard',
              colourCode: v.colourCode || '#1E293B',
              size: v.size?.trim() || 'Standard',
              stock: parseInt(v.stock, 10) || 0,
              price: v.price ? parseFloat(v.price) : null,
              sku: v.sku || `${updated.sku}-${(v.colour || 'STD').substring(0, 3).toUpperCase()}-${(v.size || 'STD').replace(/\s+/g, '')}`,
            },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          images: { orderBy: { displayOrder: 'asc' } },
          variants: { orderBy: { size: 'asc' } },
        },
      });
    });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {}

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Preservation requirement: preserve existing order history even if a product is deleted!
    // Our schema has onDelete: SetNull on OrderItem -> Product, but let's safely disconnect
    await prisma.orderItem.updateMany({
      where: { productId: id },
      data: { productId: null },
    });

    await prisma.product.delete({ where: { id } });

    try {
      revalidatePath('/', 'layout');
    } catch (e) {}

    return NextResponse.json({ success: true, message: 'Product deleted successfully while preserving order history.' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
