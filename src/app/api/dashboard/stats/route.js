import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalProducts,
      activeProducts,
      totalCategories,
      pendingOrders,
      confirmedOrders,
      allOrders,
      productsWithVariants,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { status: 'PUBLISHED' } }),
      prisma.category.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'CONFIRMED' } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          variants: { select: { stock: true } },
        },
      }),
    ]);

    // Count products where total stock across all variants is 0
    let outOfStockProducts = 0;
    for (const p of productsWithVariants) {
      const sumStock = p.variants.reduce((s, v) => s + (v.stock || 0), 0);
      if (sumStock <= 0) {
        outOfStockProducts++;
      }
    }

    // Revenue calculation from confirmed, processing, shipped, delivered orders
    const completedOrders = await prisma.order.findMany({
      where: {
        status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
      },
      select: { total: true },
    });
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
        totalCategories,
        pendingOrders,
        confirmedOrders,
        totalRevenue,
        recentOrders: allOrders,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
