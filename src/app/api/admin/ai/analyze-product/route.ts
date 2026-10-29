import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { Category } from '@/server/models/Category';
import { Collection } from '@/server/models/Collection';
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
    const {
      imageUrl,
      fileKey,
      title,
      detectedColors,
      department,
      productType,
      forceField,
    } = body;

    if (!imageUrl && !fileKey) {
      return NextResponse.json(
        { success: false, error: 'Either imageUrl or fileKey is required for AI analysis.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Retrieve active categories and collections from database as source of truth
    const [categories, collections] = await Promise.all([
      Category.find({ isActive: true })
        .select('_id name slug departments group')
        .sort({ displayOrder: 1 })
        .lean(),
      Collection.find({ isActive: true }).select('_id title slug').lean(),
    ]);

    const formattedCategories = categories.map((c: any) => ({
      id: String(c._id),
      name: c.name,
      slug: c.slug,
      departments: c.departments || ['UNISEX'],
      group: c.group || 'General',
    }));

    const formattedCollections = collections.map((col: any) => ({
      id: String(col._id),
      title: col.title,
      slug: col.slug,
    }));

    const targetUrl = imageUrl || `/api/media/${fileKey}`;
    const result = await AiService.analyzeProductImage({
      imageUrl: targetUrl,
      title: title ? String(title).trim() : undefined,
      detectedColors: Array.isArray(detectedColors) ? detectedColors : undefined,
      department: department ? String(department) : undefined,
      productType: productType ? String(productType) : undefined,
      existingCategories: formattedCategories,
      existingCollections: formattedCollections,
      forceField: forceField ? String(forceField) : undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Product analyzed successfully by AI.',
      data: result,
    });
  } catch (error: any) {
    console.error('[AiAnalyzeProductAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'AI product analysis failed.' },
      { status: 500 }
    );
  }
}
