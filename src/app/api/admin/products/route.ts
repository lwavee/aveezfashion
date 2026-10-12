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
