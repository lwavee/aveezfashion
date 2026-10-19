import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { Collection } from '@/server/models/Collection';
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
    let collection = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      collection = await Collection.findById(identifier).populate('categories', 'name slug').lean();
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: identifier }).populate('categories', 'name slug').lean();
    }

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { collection },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch collection.' },
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
    let collection = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      collection = await Collection.findById(identifier);
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: identifier });
    }

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found.' },
        { status: 404 }
      );
    }

    if (body.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return NextResponse.json({ success: false, error: 'Collection Title cannot be empty.' }, { status: 400 });
      }
      collection.title = title;
    }

    if (body.slug !== undefined) {
      const newSlug = String(body.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      if (!newSlug) {
        return NextResponse.json({ success: false, error: 'Collection slug cannot be empty.' }, { status: 400 });
      }
      const collision = await Collection.findOne({ slug: newSlug, _id: { $ne: collection._id } });
      if (collision) {
        return NextResponse.json({ success: false, error: `Slug "${newSlug}" is already taken.` }, { status: 409 });
      }
      collection.slug = newSlug;
    }

    if (body.tagline !== undefined) {
      collection.tagline = String(body.tagline).trim();
    }

    if (body.description !== undefined) {
      collection.description = String(body.description).trim();
    }

    if (body.coverImage !== undefined) {
      collection.coverImage = String(body.coverImage).trim();
    }

    if (body.departments !== undefined) {
      if (!Array.isArray(body.departments) || body.departments.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Collection must belong to at least one department.' },
          { status: 400 }
        );
      }
      for (const d of body.departments) {
        if (!VALID_DEPARTMENTS.has(d)) {
          return NextResponse.json({ success: false, error: `Invalid department: "${d}".` }, { status: 400 });
        }
      }
      collection.departments = body.departments;
    }

    if (body.categories !== undefined) {
      if (Array.isArray(body.categories)) {
        collection.categories = body.categories
          .filter((id: any) => mongoose.Types.ObjectId.isValid(id))
          .map((id: any) => new mongoose.Types.ObjectId(id));
      }
    }

    if (body.featured !== undefined) {
      collection.featured = Boolean(body.featured);
    }

    if (body.isActive !== undefined) {
      collection.isActive = Boolean(body.isActive);
    }

    await collection.save();

    return NextResponse.json({
      success: true,
      message: `Collection "${collection.title}" updated successfully.`,
      data: collection,
    });
  } catch (error: any) {
    console.error('[CollectionsAPI] PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update collection.' },
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
    let collection = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      collection = await Collection.findById(identifier);
    }
    if (!collection) {
      collection = await Collection.findOne({ slug: identifier });
    }

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Collection not found.' },
        { status: 404 }
      );
    }

    // Unset collectionId on any products linked to this collection
    await Product.updateMany(
      { collectionId: collection._id },
      { $unset: { collectionId: 1 } }
    );

    await Collection.deleteOne({ _id: collection._id });

    return NextResponse.json({
      success: true,
      message: `Collection "${collection.title}" has been deleted safely.`,
    });
  } catch (error: any) {
    console.error('[CollectionsAPI] DELETE error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete collection.' },
      { status: 500 }
    );
  }
}
