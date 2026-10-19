import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Category } from '@/server/models/Category';
import { Collection } from '@/server/models/Collection';
import { getSessionFromRequest } from '@/server/auth';

const ACCESSORY_SLUGS = new Set([
  'accessories',
  'hairbands',
  'hair-clips',
  'claw-clips',
  'keychains',
  'bag-charms',
  'matching-sets',
]);

export const dynamic = 'force-dynamic';

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

    const [categories, collections] = await Promise.all([
      Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean(),
      Collection.find({ isActive: true }).sort({ title: 1 }).lean(),
    ]);

    const departments = ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];

    const formattedCategories = categories.map((c) => {
      const isAccessory =
        (c.departments && c.departments.includes('ACCESSORIES') && c.departments.length === 1) ||
        ACCESSORY_SLUGS.has(c.slug.toLowerCase());

      return {
        id: String(c._id),
        name: c.name,
        slug: c.slug,
        group: c.group || (isAccessory ? 'Hair Accessories' : 'Tops'),
        departments: (c.departments && c.departments.length > 0)
          ? c.departments
          : (isAccessory ? ['ACCESSORIES'] : ['UNISEX']),
        isAccessory,
        parentCategory: c.parentCategory ? String(c.parentCategory) : null,
      };
    });

    const clothingCategories = formattedCategories.filter((c) => !c.isAccessory);
    const accessoryCategories = formattedCategories.filter((c) => c.isAccessory);

    const formattedCollections = collections.map((col) => ({
      id: String(col._id),
      title: col.title,
      slug: col.slug,
      tagline: col.tagline,
      coverImage: col.coverImage,
      departments: (col.departments && col.departments.length > 0)
        ? col.departments
        : ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      categories: (col.categories || []).map((catId: any) => String(catId)),
    }));

    return NextResponse.json({
      success: true,
      data: {
        departments,
        categories: formattedCategories,
        clothingCategories,
        accessoryCategories,
        collections: formattedCollections,
      },
    });
  } catch (error: any) {
    console.error('[TaxonomyAPI] Error loading taxonomy:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load taxonomy.' },
      { status: 500 }
    );
  }
}
