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

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No image file provided in request.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await StorageService.uploadProductImage(
      buffer,
      file.name,
      file.type || 'image/jpeg'
    );

    return NextResponse.json({
      success: true,
      message: 'Product image uploaded successfully.',
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
