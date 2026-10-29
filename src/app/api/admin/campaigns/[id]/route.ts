import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { Campaign } from '@/server/models/Campaign';

export const runtime = 'nodejs';

// PATCH update campaign
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const body = await req.json();

    await connectToDatabase();
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found.' },
        { status: 404 }
      );
    }

    // Allowed updatable fields
    const allowedFields = [
      'name',
      'status',
      'purpose',
      'theme',
      'desktopImage',
      'mobileImage',
      'headline',
      'subheadline',
      'ctaText',
      'ctaLink',
      'offerText',
      'priority',
      'startDate',
      'endDate',
      'targetSection',
    ];

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === 'startDate' || key === 'endDate') {
          (campaign as any)[key] = body[key] ? new Date(body[key]) : null;
        } else {
          (campaign as any)[key] = body[key];
        }
      }
    }

    await campaign.save();

    // Trigger homepage revalidation if active status was modified
    try {
      revalidatePath('/');
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Campaign updated successfully (${campaign.status}).`,
      data: campaign,
    });
  } catch (error: any) {
    console.error('[CampaignsAPI PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update campaign.' },
      { status: 500 }
    );
  }
}

// DELETE or Archive campaign
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    await connectToDatabase();

    const deleted = await Campaign.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found.' },
        { status: 404 }
      );
    }

    try {
      revalidatePath('/');
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully.',
    });
  } catch (error: any) {
    console.error('[CampaignsAPI DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete campaign.' },
      { status: 500 }
    );
  }
}
