import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/server/auth';
import { StorageService } from '@/server/services/storageService';

export const runtime = 'nodejs';

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

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const target = (formData.get('target') as string | null) || '';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in request.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let result;
    if (target.includes('diwali') || target.includes('campaign')) {
      const sanitizedName = file.name.toLowerCase().replace(/[^a-z0-9_.-]/g, '-');
      const fileName = `diwali-hero-${Date.now()}-${sanitizedName}`;
      result = await StorageService.uploadCampaignAsset(
        buffer,
        `campaigns/diwali/${fileName}`,
        file.type || 'image/webp'
      );
    } else {
      result = await StorageService.uploadProductImage(
        buffer,
        file.name,
        file.type || 'image/jpeg'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully.',
      data: result,
    });
  } catch (error: any) {
    console.error('[UploadAPI] Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Image upload failed.' },
      { status: 500 }
    );
  }
}
