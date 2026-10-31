import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const policy = await prisma.policy.findUnique({ where: { slug } });
      if (!policy) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, policy });
    }

    const policies = await prisma.policy.findMany({
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ success: true, policies });
  } catch (error) {
    console.error('Fetch policies error:', error);
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, content } = body;

    if (!id || !content) {
      return NextResponse.json({ error: 'Policy ID and content are required' }, { status: 400 });
    }

    const updated = await prisma.policy.update({
      where: { id },
      data: {
        title: title || undefined,
        content: content.trim(),
      },
    });

    return NextResponse.json({ success: true, policy: updated });
  } catch (error) {
    console.error('Update policy error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update policy' }, { status: 500 });
  }
}
