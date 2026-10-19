import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { StorageService } from '@/server/services/storageService';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const segments = params.path || [];
    if (segments.length === 0) {
      return new NextResponse('Asset not found', { status: 404 });
    }

    // Sanitize each path segment to prevent directory traversal
    const safeSegments = segments.map((s) => path.basename(s));
    const fileKey = safeSegments.join('/');

    // 1. Check local file system first
    const localPath = path.resolve('public/uploads', ...safeSegments);
    const sandboxDir = path.resolve('public/uploads');

    // Strict directory boundary check
    if (localPath.startsWith(sandboxDir + path.sep) && fs.existsSync(localPath)) {
      const buffer = fs.readFileSync(localPath);
      const ext = path.extname(localPath).toLowerCase().slice(1);
      const mimeTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        webp: 'image/webp',
        gif: 'image/gif',
        avif: 'image/avif',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    // 2. Fetch from Backblaze B2 if not found locally
    const b2Asset = await StorageService.fetchB2Asset(fileKey);
    if (b2Asset) {
      return new NextResponse(new Uint8Array(b2Asset.buffer), {
        headers: {
          'Content-Type': b2Asset.mimeType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }

    return new NextResponse('Asset not found', { status: 404 });
  } catch (error: any) {
    console.error('[MediaRoute] Error serving media:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
