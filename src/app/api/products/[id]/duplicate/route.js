import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(req, { params }) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    const source = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true },
    });

    if (!source) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const uniqueTag = Date.now().toString().slice(-4);
    const newName = `${source.name} (Copy ${uniqueTag})`;
    const newSku = `${source.sku}-COPY-${uniqueTag}`;
    const newSlug = `${source.slug}-copy-${uniqueTag}`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.create({
        data: {
          name: newName,
          slug: newSlug,
          description: source.description,
          categoryId: source.categoryId,
          sku: newSku,
          sellingPrice: source.sellingPrice,
          originalPrice: source.originalPrice,
          status: 'DRAFT', // copies start as draft
          isFeatured: false,
          isNewArrival: false,
          mainImage: source.mainImage,
        },
      });

      // copy images
      for (const img of source.images) {
        await tx.productImage.create({
          data: {
            productId: prod.id,
            url: img.url,
            displayOrder: img.displayOrder,
            isMain: img.isMain,
          },
        });
      }

      // copy variants
      for (const v of source.variants) {
        await tx.productVariant.create({
          data: {
            productId: prod.id,
            colour: v.colour,
            colourCode: v.colourCode,
            size: v.size,
            stock: v.stock,
            price: v.price,
            sku: `${newSku}-${v.colour.substring(0, 3).toUpperCase()}-${v.size.replace(/\s+/g, '')}`,
          },
        });
      }

      return tx.product.findUnique({
        where: { id: prod.id },
        include: {
          category: true,
          images: true,
          variants: true,
        },
      });
    });

    return NextResponse.json({ success: true, product: duplicated });
  } catch (error) {
    console.error('Duplicate product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to duplicate product' }, { status: 500 });
  }
}
