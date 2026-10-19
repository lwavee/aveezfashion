import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { Collection } from '@/server/models/Collection';
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

    const collections = await Collection.find({})
      .populate('categories', 'name slug')
      .sort({ title: 1 })
      .lean();

    const formatted = await Promise.all(
      collections.map(async (col: any) => {
        // Count products linked via Product.collectionId or Collection.products
        const productCount = Math.max(
          Array.isArray(col.products) ? col.products.length : 0,
          await Product.countDocuments({ collectionId: col._id })
        );

        return {
          id: String(col._id),
          title: col.title,
          slug: col.slug,
          tagline: col.tagline || '',
          description: col.description || '',
          coverImage: col.coverImage || '',
          featured: Boolean(col.featured),
          departments: col.departments && col.departments.length > 0 ? col.departments : ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
          categories: (col.categories || []).map((cat: any) => ({
            id: String(cat._id || cat),
            name: cat.name || '',
            slug: cat.slug || '',
          })),
          productCount,
          isActive: Boolean(col.isActive),
          createdAt: col.createdAt,
          updatedAt: col.updatedAt,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        collections: formatted,
        total: formatted.length,
      },
    });
  } catch (error: any) {
    console.error('[CollectionsAPI] GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collections.' },
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
    const {
      title,
      slug,
      tagline = '',
      description = '',
      coverImage = '/images/heroimage1.png',
      featured = false,
      departments = ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'],
      categories = [],
      isActive = true,
    } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Collection Title is required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(departments) || departments.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Collection must be associated with at least one department.' },
        { status: 400 }
      );
    }

    for (const d of departments) {
      if (!VALID_DEPARTMENTS.has(d)) {
        return NextResponse.json(
          { success: false, error: `Invalid department: "${d}".` },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();

    const cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const existing = await Collection.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Collection with slug "${cleanSlug}" already exists ("${existing.title}").` },
        { status: 409 }
      );
    }

    // Filter valid Category ObjectIds if provided
    const validCategoryIds = Array.isArray(categories)
      ? categories
          .filter((id) => mongoose.Types.ObjectId.isValid(id))
          .map((id) => new mongoose.Types.ObjectId(id))
      : [];

    const newCollection = await Collection.create({
      title: title.trim(),
      slug: cleanSlug,
      tagline: tagline.trim(),
      description: description.trim(),
      coverImage: coverImage.trim() || '/images/heroimage1.png',
      featured: Boolean(featured),
      departments,
      categories: validCategoryIds,
      products: [],
      isActive: Boolean(isActive),
    });

    return NextResponse.json({
      success: true,
      message: `Collection "${newCollection.title}" created successfully.`,
      data: newCollection,
    });
  } catch (error: any) {
    console.error('[CollectionsAPI] POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create collection.' },
      { status: 500 }
    );
  }
}
