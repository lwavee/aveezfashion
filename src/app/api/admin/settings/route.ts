import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { CatalogService } from '@/server/services/catalogService';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const settings = await CatalogService.getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('[AdminSettingsRoute] GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin role required.' }, { status: 401 });
    }

    const body = await req.json();
    const { seasonalTheme, storeName, supportEmail, supportPhone, freeShippingThreshold } = body;

    let updatedSettings;
    if (seasonalTheme) {
      updatedSettings = await CatalogService.updateSeasonalTheme(seasonalTheme);
    } else {
      updatedSettings = await CatalogService.getSettings();
    }

    // Instantly purge Next.js server-rendered cache across all customer routes
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/shop');
    } catch (e) {
      console.warn('[AdminSettingsRoute] revalidatePath warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: 'Store settings successfully updated.',
      settings: updatedSettings,
    });
  } catch (error: any) {
    console.error('[AdminSettingsRoute] PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
