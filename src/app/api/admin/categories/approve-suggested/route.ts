import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/server/auth';
import { connectToDatabase } from '@/server/db/connect';
import { Category } from '@/server/models/Category';

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
    const { name, department = 'UNISEX', group = 'General' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Valid category name is required.' },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const slug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    await connectToDatabase();

    // Check if category already exists to avoid duplicate categories
    let existing = await Category.findOne({
      $or: [{ slug }, { name: { $regex: new RegExp(`^${cleanName}$`, 'i') } }],
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Category already exists.',
        data: {
          id: String(existing._id),
          name: existing.name,
          slug: existing.slug,
          departments: existing.departments,
          group: existing.group,
        },
      });
    }

    const deptArray = Array.isArray(department) ? department : [department];
    const newCat = new Category({
      name: cleanName,
      slug,
      departments: deptArray,
      group: group || 'General',
      isActive: true,
      displayOrder: 99,
    });

    await newCat.save();

    return NextResponse.json({
      success: true,
      message: `Category "${cleanName}" approved and created successfully.`,
      data: {
        id: String(newCat._id),
        name: newCat.name,
        slug: newCat.slug,
        departments: newCat.departments,
        group: newCat.group,
      },
    });
  } catch (error: any) {
    console.error('[ApproveCategoryAPI] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to approve category.' },
      { status: 500 }
    );
  }
}
