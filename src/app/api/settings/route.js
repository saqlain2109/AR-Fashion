import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          id: 'default',
          businessName: 'AR Fashion House',
          primaryPhone: '+917304396709',
          secondaryPhone: '+918080010107',
          businessEmail: 'contact@arfashionhouse.com',
          shippingCharge: 100,
          freeShippingThreshold: 2000,
          currency: 'INR',
          currencySymbol: '₹',
          whatsappUrl: 'https://wa.me/917304396709',
          address: null,
        },
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const body = await req.json();
    const {
      businessName,
      storeLogo,
      primaryPhone,
      secondaryPhone,
      defaultRecipient,
      businessEmail,
      shippingCharge,
      freeShippingThreshold,
      currency,
      currencySymbol,
      storeAnnouncement,
      announcementActive,
      facebookUrl,
      instagramUrl,
      whatsappUrl,
      address,
    } = body;

    const updated = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: {
        businessName: businessName?.trim() || 'AR Fashion House',
        storeLogo: storeLogo !== undefined ? storeLogo : null,
        primaryPhone: primaryPhone?.trim() || '+917304396709',
        secondaryPhone: secondaryPhone?.trim() || null,
        defaultRecipient: defaultRecipient || 'primary',
        businessEmail: businessEmail?.trim() || 'contact@arfashionhouse.com',
        shippingCharge: parseFloat(shippingCharge) || 0,
        freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
        currency: currency ? currency.trim() : 'INR',
        currencySymbol: (currencySymbol !== undefined && currencySymbol !== null && String(currencySymbol).trim() !== '') ? String(currencySymbol) : '₹',
        storeAnnouncement: storeAnnouncement !== undefined ? storeAnnouncement : null,
        announcementActive: Boolean(announcementActive),
        facebookUrl: facebookUrl !== undefined ? facebookUrl : null,
        instagramUrl: instagramUrl !== undefined ? instagramUrl : null,
        whatsappUrl: whatsappUrl !== undefined ? whatsappUrl : null,
        address: address !== undefined ? address : null,
      },
      create: {
        id: 'default',
        businessName: businessName?.trim() || 'AR Fashion House',
        storeLogo: storeLogo || null,
        primaryPhone: primaryPhone?.trim() || '+917304396709',
        secondaryPhone: secondaryPhone?.trim() || null,
        defaultRecipient: defaultRecipient || 'primary',
        businessEmail: businessEmail?.trim() || 'contact@arfashionhouse.com',
        shippingCharge: parseFloat(shippingCharge) || 0,
        freeShippingThreshold: freeShippingThreshold ? parseFloat(freeShippingThreshold) : null,
        currency: currency ? currency.trim() : 'INR',
        currencySymbol: (currencySymbol !== undefined && currencySymbol !== null && String(currencySymbol).trim() !== '') ? String(currencySymbol) : '₹',
        storeAnnouncement: storeAnnouncement || null,
        announcementActive: Boolean(announcementActive),
        facebookUrl: facebookUrl || null,
        instagramUrl: instagramUrl || null,
        whatsappUrl: whatsappUrl || null,
        address: address || null,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(req) {
  return PUT(req);
}
