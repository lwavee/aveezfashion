import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { Product } from '@/server/models/Product';
import { Category } from '@/server/models/Category';
import { getSessionFromRequest } from '@/server/auth';

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
    let product = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier).lean();
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ slug: identifier }, { sku: identifier }] }).lean();
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch product.' },
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
    let product = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier);
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ slug: identifier }, { sku: identifier }] });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Handle Category mapping: allow ObjectId or string slug
    if (body.category !== undefined) {
      if (mongoose.Types.ObjectId.isValid(body.category)) {
        product.category = new mongoose.Types.ObjectId(body.category);
      } else if (typeof body.category === 'string') {
        const catDoc = await Category.findOne({ slug: body.category.toLowerCase() });
        if (catDoc) {
          product.category = catDoc._id as any;
        }
      }
    }

    if (body.title !== undefined) product.title = body.title.trim();
    if (body.description !== undefined) product.description = body.description.trim();
    if (body.gender !== undefined) product.gender = body.gender;
    if (body.basePrice !== undefined) product.basePrice = Number(body.basePrice);
    if (body.salePrice !== undefined) product.salePrice = body.salePrice ? Number(body.salePrice) : undefined;
    if (body.status !== undefined) product.status = body.status;
    if (body.isFeatured !== undefined) product.isFeatured = Boolean(body.isFeatured);
    if (body.isBestSeller !== undefined) product.isBestSeller = Boolean(body.isBestSeller);
    if (body.isNewArrival !== undefined) product.isNewArrival = Boolean(body.isNewArrival);
    if (body.isAveezOriginal !== undefined) product.isAveezOriginal = Boolean(body.isAveezOriginal);
    if (body.accessoryType !== undefined) product.accessoryType = body.accessoryType || undefined;

    if (Array.isArray(body.images)) {
      product.images = body.images;
    }

    if (Array.isArray(body.variants) && body.variants.length > 0) {
      product.variants = body.variants.map((v: any, idx: number) => ({
        sku: v.sku || `${product.sku}-${v.size || idx}`,
        size: v.size || 'ONESIZE',
        color: v.color || 'Default',
        colorHex: v.colorHex || '#0A0A0A',
        stock: Math.max(0, Number(v.stock) || 0),
        barcode: v.barcode,
      }));
    }

    if (Array.isArray(body.tags)) {
      product.tags = body.tags;
    }

    if (Array.isArray(body.matchingColors)) {
      product.matchingColors = body.matchingColors;
    }

    if (body.attributes && typeof body.attributes === 'object') {
      product.attributes = {
        ...product.attributes,
        ...body.attributes,
      };
    }

    await product.save();

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully.',
      data: { product },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product.' },
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
        { success: false, error: 'Unauthorized: Only administrators can archive or remove products.' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const identifier = params.id;
    let product = null;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      product = await Product.findById(identifier);
    }
    if (!product) {
      product = await Product.findOne({ $or: [{ slug: identifier }, { sku: identifier }] });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found.' },
        { status: 404 }
      );
    }

    // Soft-archive to preserve data integrity and order history
    product.status = 'ARCHIVED';
    await product.save();

    return NextResponse.json({
      success: true,
      message: `Product "${product.title}" has been successfully archived.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to archive product.' },
      { status: 500 }
    );
  }
}
