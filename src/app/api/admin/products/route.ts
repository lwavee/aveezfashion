import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Product } from '@/server/models/Product';
import { getSessionFromRequest } from '@/server/auth';

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

    const products = await Product.find({}).sort({ createdAt: -1 }).lean();

    const formatted = products.map((p) => {
      const variants = p.variants || [];
      const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

      const productPrice = p.salePrice || p.basePrice || 0;
      const heroImg = typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0]?.url || '');

      return {
        id: String(p._id),
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        price: `₹${productPrice.toLocaleString('en-IN')}`,
        rawPrice: productPrice,
        variantsCount: variants.length,
        variants: variants.map((v) => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock: v.stock,
        })),
        totalStock,
        isActive: p.status === 'PUBLISHED',
        status: p.status,
        imagesCount: (p.images || []).length,
        heroImage: heroImg,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        products: formatted,
        totalCount: formatted.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch catalog.' },
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
      sku,
      description,
      gender = 'UNISEX',
      category,
      subCategory,
      basePrice,
      salePrice,
      images = [],
      variants = [],
      attributes = {},
      tags = [],
      status = 'PUBLISHED',
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = true,
      accessoryType,
      matchingColors = [],
    } = body;

    if (!title || !description || !category || basePrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, description, category, and basePrice are required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalizedSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const generatedSku = (sku || `AVZ-${Date.now().toString(36)}`).toUpperCase();

    // Ensure variants have at least 1 entry if none passed
    const defaultVariants =
      variants.length > 0
        ? variants
        : [
            {
              sku: `${generatedSku}-ONE`,
              size: 'ONESIZE',
              color: 'Default',
              colorHex: '#0A0A0A',
              stock: 10,
            },
          ];

    const newProduct = await Product.create({
      title: title.trim(),
      slug: normalizedSlug,
      sku: generatedSku,
      description: description.trim(),
      gender,
      category,
      subCategory: subCategory || undefined,
      basePrice: Number(basePrice),
      salePrice: salePrice ? Number(salePrice) : undefined,
      images,
      variants: defaultVariants,
      attributes,
      tags: Array.isArray(tags) ? tags : [],
      status,
      isFeatured,
      isBestSeller,
      isNewArrival,
      accessoryType,
      matchingColors,
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully.',
      data: newProduct,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product.' },
      { status: 500 }
    );
  }
}

