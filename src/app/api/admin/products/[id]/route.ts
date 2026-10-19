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

    const VALID_DEPTS = new Set(['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES']);

    // Determine target department
    let targetDept = product.department;
    if (body.department !== undefined) {
      if (!VALID_DEPTS.has(body.department)) {
        return NextResponse.json(
          { success: false, error: `Invalid department: "${body.department}".` },
          { status: 400 }
        );
      }
      targetDept = body.department;
      product.department = targetDept;

      // Align legacy fields
      if (targetDept === 'ACCESSORIES') {
        product.productType = 'accessories';
        product.gender = 'UNISEX';
      } else if (targetDept === 'MEN') {
        product.gender = 'MEN';
        product.productType = 'clothing';
      } else if (targetDept === 'WOMEN') {
        product.gender = 'WOMEN';
        product.productType = 'clothing';
      } else if (targetDept === 'UNISEX') {
        product.gender = 'UNISEX';
        product.productType = 'clothing';
      }
    }

    if (!targetDept) {
      targetDept = product.productType === 'accessories' ? 'ACCESSORIES' : (product.gender || 'UNISEX');
      product.department = targetDept;
    }

    // Determine target category
    let targetCategoryDoc = null;
    if (body.category !== undefined) {
      if (mongoose.Types.ObjectId.isValid(body.category)) {
        targetCategoryDoc = await Category.findById(body.category);
      } else if (typeof body.category === 'string') {
        targetCategoryDoc = await Category.findOne({ slug: body.category.toLowerCase().trim() });
      }

      if (!targetCategoryDoc) {
        return NextResponse.json(
          { success: false, error: `Category "${body.category}" was not found.` },
          { status: 400 }
        );
      }

      if (!targetCategoryDoc.isActive) {
        return NextResponse.json(
          { success: false, error: `Category "${targetCategoryDoc.name}" is currently inactive.` },
          { status: 400 }
        );
      }

      const catDepts: string[] = Array.isArray(targetCategoryDoc.departments) && targetCategoryDoc.departments.length > 0
        ? targetCategoryDoc.departments
        : ['UNISEX'];

      if (!catDepts.includes(targetDept)) {
        return NextResponse.json(
          {
            success: false,
            error: `Category "${targetCategoryDoc.name}" does not belong to the "${targetDept}" department. (Allowed: ${catDepts.join(', ')})`,
          },
          { status: 400 }
        );
      }

      product.category = targetCategoryDoc._id as any;
    } else {
      // Validate current category against target department
      targetCategoryDoc = await Category.findById(product.category);
      if (targetCategoryDoc) {
        const catDepts: string[] = Array.isArray(targetCategoryDoc.departments) && targetCategoryDoc.departments.length > 0
          ? targetCategoryDoc.departments
          : ['UNISEX'];
        if (!catDepts.includes(targetDept)) {
          return NextResponse.json(
            {
              success: false,
              error: `Existing category "${targetCategoryDoc.name}" does not belong to the newly selected department "${targetDept}". Please choose a valid category.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // Determine target collection
    if (body.collectionId !== undefined) {
      const { Collection } = await import('@/server/models/Collection');
      const oldCollectionId = product.collectionId;

      if (!body.collectionId || body.collectionId === '' || body.collectionId === null) {
        // Clear collection
        product.collectionId = undefined;
        if (oldCollectionId) {
          await Collection.findByIdAndUpdate(oldCollectionId, {
            $pull: { products: product._id },
          });
        }
      } else {
        if (!mongoose.Types.ObjectId.isValid(body.collectionId)) {
          return NextResponse.json(
            { success: false, error: 'Invalid Collection ID.' },
            { status: 400 }
          );
        }

        const collectionDoc = await Collection.findById(body.collectionId);
        if (!collectionDoc) {
          return NextResponse.json(
            { success: false, error: 'Collection not found.' },
            { status: 400 }
          );
        }

        if (!collectionDoc.isActive) {
          return NextResponse.json(
            { success: false, error: `Collection "${collectionDoc.title}" is currently inactive.` },
            { status: 400 }
          );
        }

        const colDepts: string[] = Array.isArray(collectionDoc.departments) && collectionDoc.departments.length > 0
          ? collectionDoc.departments
          : ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];

        if (!colDepts.includes(targetDept)) {
          return NextResponse.json(
            {
              success: false,
              error: `Collection "${collectionDoc.title}" is not valid for department "${targetDept}".`,
            },
            { status: 400 }
          );
        }

        if (Array.isArray(collectionDoc.categories) && collectionDoc.categories.length > 0 && targetCategoryDoc) {
          const hasCategory = collectionDoc.categories.some(
            (catRef: any) => String(catRef) === String(targetCategoryDoc!._id)
          );
          if (!hasCategory) {
            return NextResponse.json(
              {
                success: false,
                error: `Collection "${collectionDoc.title}" is not valid for category "${targetCategoryDoc.name}".`,
              },
              { status: 400 }
            );
          }
        }

        product.collectionId = collectionDoc._id as any;

        // Sync Collection products array
        if (oldCollectionId && String(oldCollectionId) !== String(collectionDoc._id)) {
          await Collection.findByIdAndUpdate(oldCollectionId, {
            $pull: { products: product._id },
          });
        }
        await Collection.findByIdAndUpdate(collectionDoc._id, {
          $addToSet: { products: product._id },
        });
      }
    }

    if (body.title !== undefined) product.title = body.title.trim();
    if (body.description !== undefined) product.description = body.description.trim();
    if (body.gender !== undefined) product.gender = body.gender;
    if (body.basePrice !== undefined) {
      const bp = Number(body.basePrice);
      if (isNaN(bp) || bp < 0) {
        return NextResponse.json({ success: false, error: 'Base price must be a non-negative number.' }, { status: 400 });
      }
      product.basePrice = bp;
    }
    if (body.salePrice !== undefined) {
      if (body.salePrice === null || body.salePrice === '') {
        product.salePrice = undefined;
      } else {
        const sp = Number(body.salePrice);
        if (isNaN(sp) || sp < 0) {
          return NextResponse.json({ success: false, error: 'Sale price must be a non-negative number.' }, { status: 400 });
        }
        if (sp >= product.basePrice) {
          return NextResponse.json({ success: false, error: 'Sale price must be lower than base price.' }, { status: 400 });
        }
        product.salePrice = sp;
      }
    }
    if (body.costPrice !== undefined) {
      product.costPrice = body.costPrice ? Math.max(0, Number(body.costPrice)) : undefined;
    }
    if (body.productType !== undefined) product.productType = body.productType;
    if (body.lowStockThreshold !== undefined) product.lowStockThreshold = Math.max(1, Number(body.lowStockThreshold) || 5);
    if (body.bundleDetails !== undefined) product.bundleDetails = body.bundleDetails;
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
