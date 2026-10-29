import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/server/auth';
import { AiService } from '@/server/services/aiService';

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

    const body = await req.json();
    const { title, images } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one product image to specify colors.' },
        { status: 400 }
      );
    }

    const result = await AiService.groupProductImagesByColor({
      title: title ? String(title).trim() : 'Apparel Garment',
      images,
    });

    return NextResponse.json({
      success: true,
      message: `Analyzed ${images.length} images into ${result.groups.length} color groups.`,
      data: result,
    });
  } catch (error: any) {
    console.error('[AiGroupColorsAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Color grouping failed.' },
      { status: 500 }
    );
  }
}

