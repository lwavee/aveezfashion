import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { Campaign } from '@/server/models/Campaign';

export const runtime = 'nodejs';

// GET all campaigns with filtering
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const theme = searchParams.get('theme');

    const filter: any = {};
    if (status && status !== 'ALL') filter.status = status;
    if (theme && theme !== 'ALL') filter.theme = theme;

    const campaigns = await Campaign.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    console.error('[CampaignsAPI GET] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch campaigns.' },
      { status: 500 }
    );
  }
}

// POST create or schedule new campaign
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (session.role !== 'ADMIN' && session.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      purpose = 'hero_banner',
      theme = 'custom',
      status = 'DRAFT',
      desktopImage,
      mobileImage,
      headline,
      subheadline,
      ctaText = 'EXPLORE COLLECTION →',
      ctaLink = '/shop',
      offerText,
      priority = 0,
      startDate,
      endDate,
      targetSection = 'hero',
    } = body;

    if (!name || !desktopImage) {
      return NextResponse.json(
        { success: false, error: 'Campaign name and desktop image are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + `-${Date.now()}`;

    const newCampaign = new Campaign({
      name: name.trim(),
      slug,
      purpose,
      theme,
      status,
      desktopImage,
      mobileImage: mobileImage || desktopImage,
      headline,
      subheadline,
      ctaText,
      ctaLink,
      offerText,
      priority: parseInt(priority, 10) || 0,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      targetSection,
    });

    await newCampaign.save();

    // Trigger homepage revalidation if campaign is published as ACTIVE
    if (status === 'ACTIVE') {
      try {
        revalidatePath('/');
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully.',
      data: newCampaign,
    });
  } catch (error: any) {
    console.error('[CampaignsAPI POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create campaign.' },
      { status: 500 }
    );
  }
}
