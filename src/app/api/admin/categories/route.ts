import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Category } from '@/server/models/Category';
import { Product } from '@/server/models/Product';
import { getSessionFromRequest } from '@/server/auth';

export const dynamic = 'force-dynamic';

const VALID_DEPARTMENTS = new Set(['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES']);

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

    const categories = await Category.find({})
      .sort({ group: 1, name: 1 })
      .lean();

    // Compute product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (cat: any) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        return {
          id: String(cat._id),
          name: cat.name,
          slug: cat.slug,
          group: cat.group || 'General',
          departments: cat.departments && cat.departments.length > 0 ? cat.departments : ['UNISEX'],
          description: cat.description || '',
          isActive: Boolean(cat.isActive),
          displayOrder: cat.displayOrder || 0,
          productCount,
          createdAt: cat.createdAt,
          updatedAt: cat.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        categories: categoriesWithCounts,
        total: categoriesWithCounts.length,
      },
    });
  } catch (error: any) {
    console.error('[CategoriesAPI] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch categories.' },
      { status: 500 }
    );
  }
}

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
    const { name, slug, departments, group = 'General', description = '', isActive = true } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Category Name is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(departments) || departments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one department (Men, Women, Unisex, or Accessories) must be selected.' },
        { status: 400 }
      );
    }

    for (const d of departments) {
      if (!VALID_DEPARTMENTS.has(d)) {
        return NextResponse.json(
          { success: false, error: `Invalid department: "${d}". Supported departments are Men, Women, Unisex, Accessories.` },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    // Normalized slug
    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Category.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Category with slug "${cleanSlug}" already exists ("${existing.name}"). Avoid creating duplicate categories.` },
        { status: 409 }
      );
    }

    const count = await Category.countDocuments();
    const newCategory = await Category.create({
      name: name.trim(),
      slug: cleanSlug,
      group: group.trim() || 'General',
      departments,
      description: description.trim(),
      isActive: Boolean(isActive),
      displayOrder: count + 1,
    });

    return NextResponse.json({
      success: true,
      message: `Category "${newCategory.name}" created successfully.`,
      data: newCategory,
    });
  } catch (error: any) {
    console.error('[CategoriesAPI] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create category.' },
      { status: 500 }
    );
  }
}
