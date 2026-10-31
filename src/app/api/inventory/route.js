import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // 'all', 'low', 'out', 'in'

    const where = {};

    if (categoryId) {
      where.product = { categoryId };
    }

    if (search) {
      where.OR = [
        { product: { name: { contains: search } } },
        { product: { sku: { contains: search } } },
        { colour: { contains: search } },
        { size: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (status === 'out') {
      where.stock = { lte: 0 };
    } else if (status === 'low') {
      where.stock = { gt: 0, lte: 5 };
    } else if (status === 'in') {
      where.stock = { gt: 5 };
    }

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: [
        { product: { name: 'asc' } },
        { colour: 'asc' },
        { size: 'asc' },
      ],
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            mainImage: true,
            sellingPrice: true,
            status: true,
            category: { select: { id: true, name: true } },
          },
        },
      },
    });

    const enrichedVariants = variants.map(v => {
      let stockStatus = 'In Stock';
      if (v.stock <= 0) stockStatus = 'Out of Stock';
      else if (v.stock <= 5) stockStatus = 'Low Stock';

      return {
        ...v,
        productName: v.product.name,
        categoryName: v.product.category?.name || 'Uncategorized',
        productSku: v.product.sku,
        productStatus: v.product.status,
        mainImage: v.product.mainImage,
        stockStatus,
      };
    });

    return NextResponse.json({ success: true, variants: enrichedVariants });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { variantId, stock, isActive } = body;

    if (!variantId) {
      return NextResponse.json({ error: 'variantId is required' }, { status: 400 });
    }

    const updateData = {};
    if (stock !== undefined) {
      const numStock = parseInt(stock, 10);
      if (isNaN(numStock) || numStock < 0) {
        return NextResponse.json({ error: 'Stock must be a non-negative integer' }, { status: 400 });
      }
      updateData.stock = numStock;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const updated = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: {
        product: {
          select: { id: true, name: true, sku: true },
        },
      },
    });

    return NextResponse.json({ success: true, variant: updated });
  } catch (error) {
    console.error('Inventory update error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update inventory' }, { status: 500 });
  }
}
