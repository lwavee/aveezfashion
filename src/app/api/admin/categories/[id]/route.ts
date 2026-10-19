import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { Category } from '@/server/models/Category';
import { Product } from '@/server/models/Product';
import { getSessionFromRequest } from '@/server/auth';

const VALID_DEPARTMENTS = new Set(['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES']);

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const identifier = params.id;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await Category.findById(identifier).lean();
    }
    if (!category) {
      category = await Category.findOne({ slug: identifier }).lean();
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    const productCount = await Product.countDocuments({ category: category._id });

    return NextResponse.json({
      success: true,
      data: {
        category: {
          ...category,
          productCount,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    await connectToDatabase();

    const identifier = params.id;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await Category.findById(identifier);
    }
    if (!category) {
      category = await Category.findOne({ slug: identifier });
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json({ success: false, error: 'Category Name cannot be empty.' }, { status: 400 });
      }
      category.name = name;
    }

    if (body.slug !== undefined) {
      const newSlug = String(body.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!newSlug) {
        return NextResponse.json({ success: false, error: 'Category slug cannot be empty.' }, { status: 400 });
      }
      // Check collision
      const collision = await Category.findOne({ slug: newSlug, _id: { $ne: category._id } });
      if (collision) {
        return NextResponse.json({ success: false, error: `Slug "${newSlug}" is already taken by "${collision.name}".` }, { status: 409 });
      }
      category.slug = newSlug;
    }

    if (body.departments !== undefined) {
      if (!Array.isArray(body.departments) || body.departments.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Category must belong to at least one department.' },
          { status: 400 }
        );
      }
      for (const d of body.departments) {
        if (!VALID_DEPARTMENTS.has(d)) {
          return NextResponse.json({ success: false, error: `Invalid department: "${d}".` }, { status: 400 });
        }
      }
      category.departments = body.departments;
    }

    if (body.group !== undefined) {
      category.group = String(body.group).trim() || 'General';
    }

    if (body.description !== undefined) {
      category.description = String(body.description).trim();
    }

    if (body.isActive !== undefined) {
      category.isActive = Boolean(body.isActive);
    }

    if (body.displayOrder !== undefined) {
      category.displayOrder = Number(body.displayOrder) || 0;
    }

    await category.save();

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" updated successfully.`,
      data: category,
    });
  } catch (error: any) {
    console.error('[CategoriesAPI] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const identifier = params.id;
    let category = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      category = await Category.findById(identifier);
    }
    if (!category) {
      category = await Category.findOne({ slug: identifier });
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category not found.' },
        { status: 404 }
      );
    }

    // Safety check: Avoid deleting categories that are still used by products
    const inUseCount = await Product.countDocuments({
      $or: [{ category: category._id }, { subCategory: category._id }],
    });

    if (inUseCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete category "${category.name}" because ${inUseCount} product(s) currently depend on it. Please reassign the products first or deactivate this category instead.`,
          inUseCount,
        },
        { status: 400 }
      );
    }

    await Category.deleteOne({ _id: category._id });

    return NextResponse.json({
      success: true,
      message: `Category "${category.name}" has been deleted safely.`,
    });
  } catch (error: any) {
    console.error('[CategoriesAPI] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category.' },
      { status: 500 }
    );
  }
}
