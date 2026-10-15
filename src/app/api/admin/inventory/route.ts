import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { Product } from '@/server/models/Product';
import { getSessionFromRequest } from '@/server/auth';

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    await connectToDatabase();

    const products = await Product.find({}, { title: 1, slug: 1, sku: 1, variants: 1, status: 1 }).lean();

    const variantsList: any[] = [];
    let totalUnits = 0;
    let lowStockCount = 0;

    for (const p of products) {
      for (const v of p.variants || []) {
        const stock = v.stock || 0;
        totalUnits += stock;
        const isLow = stock <= 5;
        if (isLow) lowStockCount++;

        variantsList.push({
          productId: String(p._id),
          productTitle: p.title,
          productSlug: p.slug,
          sku: v.sku,
          size: v.size,
          color: v.color,
          stock,
          isLowStock: isLow,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalVariants: variantsList.length,
        totalUnits,
        lowStockCount,
        variants: variantsList,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inventory.' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator privileges required.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { sku, setStock, adjustment } = body;

    if (!sku || typeof sku !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Variant SKU is required.' },
        { status: 400 }
      );
    }

    if (setStock === undefined && adjustment === undefined) {
      return NextResponse.json(
        { success: false, error: 'Either setStock or adjustment is required.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let updatedProduct;

    if (setStock !== undefined) {
      const stockNum = Math.max(0, parseInt(String(setStock), 10));
      if (isNaN(stockNum)) {
        return NextResponse.json(
          { success: false, error: 'setStock must be a valid integer.' },
          { status: 400 }
        );
      }

      updatedProduct = await Product.findOneAndUpdate(
        { 'variants.sku': sku.trim().toUpperCase() },
        { $set: { 'variants.$.stock': stockNum } },
        { new: true }
      );
    } else if (adjustment !== undefined) {
      const adjNum = parseInt(String(adjustment), 10);
      if (isNaN(adjNum)) {
        return NextResponse.json(
          { success: false, error: 'adjustment must be a valid integer.' },
          { status: 400 }
        );
      }

      // If decrementing, ensure we don't drop below 0
      if (adjNum < 0) {
        updatedProduct = await Product.findOneAndUpdate(
          {
            'variants.sku': sku.trim().toUpperCase(),
            'variants.stock': { $gte: Math.abs(adjNum) },
          },
          { $inc: { 'variants.$.stock': adjNum } },
          { new: true }
        );

        if (!updatedProduct) {
          // Check if product exists to give accurate error
          const exists = await Product.findOne({ 'variants.sku': sku.trim().toUpperCase() });
          if (!exists) {
            return NextResponse.json(
              { success: false, error: `SKU "${sku}" not found.` },
              { status: 404 }
            );
          }
          return NextResponse.json(
            { success: false, error: `Cannot decrement stock below zero.` },
            { status: 400 }
          );
        }
      } else {
        updatedProduct = await Product.findOneAndUpdate(
          { 'variants.sku': sku.trim().toUpperCase() },
          { $inc: { 'variants.$.stock': adjNum } },
          { new: true }
        );
      }
    }

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: `Variant with SKU "${sku}" was not found.` },
        { status: 404 }
      );
    }

    const updatedVariant = updatedProduct.variants.find(
      (v: any) => v.sku.toUpperCase() === sku.trim().toUpperCase()
    );

    return NextResponse.json({
      success: true,
      message: `Inventory updated for SKU ${sku}.`,
      data: {
        sku: updatedVariant?.sku,
        newStock: updatedVariant?.stock,
        productTitle: updatedProduct.title,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inventory.' },
      { status: 500 }
    );
  }
}
