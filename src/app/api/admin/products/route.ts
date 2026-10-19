import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { Product } from '@/server/models/Product';
import { Category } from '@/server/models/Category';
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

    const formatted = products.map((p: any) => {
      const variants = p.variants || [];
      const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

      const productPrice = p.salePrice || p.basePrice || 0;
      const heroImg = typeof p.images?.[0] === 'string' ? p.images[0] : (p.images?.[0]?.url || '');

      return {
        id: String(p._id),
        title: p.title,
        slug: p.slug,
        sku: p.sku,
        price: `₹${productPrice.toLocaleString('en-IN')}`,
        rawPrice: productPrice,
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        costPrice: p.costPrice,
        gender: p.gender || 'UNISEX',
        department: p.department || (p.productType === 'accessories' ? 'ACCESSORIES' : (p.gender || 'UNISEX')),
        category: p.category ? String(p.category) : '',
        collectionId: p.collectionId ? String(p.collectionId) : '',
        productType: p.productType || 'clothing',
        lowStockThreshold: p.lowStockThreshold ?? 5,
        variantsCount: variants.length,
        variants: variants.map((v: any) => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          colorHex: v.colorHex || '#0A0A0A',
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
      collectionId,
      basePrice,
      salePrice,
      costPrice,
      productType = 'clothing',
      lowStockThreshold = 5,
      bundleDetails,
      images = [],
      variants = [],
      attributes = {},
      tags = [],
      status = 'PUBLISHED',
      isFeatured = false,
      isBestSeller = false,
      isNewArrival = true,
      isAveezOriginal = false,
      accessoryType,
      matchingColors = [],
      metaTitle,
      metaDescription,
    } = body;

    await connectToDatabase();

    const isPublishing = status === 'PUBLISHED';

    // 1. Minimum Title and Category check (applies to both draft and publish)
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Product Title is required.' },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Category selection is required.' },
        { status: 400 }
      );
    }

    // 2. Pricing Validation
    const parsedBasePrice = Number(basePrice);
    if (isNaN(parsedBasePrice) || parsedBasePrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Base Price must be a valid non-negative number.' },
        { status: 400 }
      );
    }

    let parsedSalePrice: number | undefined = undefined;
    if (salePrice !== undefined && salePrice !== null && salePrice !== '') {
      parsedSalePrice = Number(salePrice);
      if (isNaN(parsedSalePrice) || parsedSalePrice < 0) {
        return NextResponse.json(
          { success: false, error: 'Sale Price must be a valid non-negative number.' },
          { status: 400 }
        );
      }
      if (parsedSalePrice >= parsedBasePrice) {
        return NextResponse.json(
          { success: false, error: 'Sale Price must be lower than the Base Price.' },
          { status: 400 }
        );
      }
    }

    let parsedCostPrice: number | undefined = undefined;
    if (costPrice !== undefined && costPrice !== null && costPrice !== '') {
      parsedCostPrice = Number(costPrice);
      if (isNaN(parsedCostPrice) || parsedCostPrice < 0) {
        return NextResponse.json(
          { success: false, error: 'Cost Price must be a non-negative number.' },
          { status: 400 }
        );
      }
    }

    // 3. Strict Publishing Validations
    if (isPublishing) {
      if (!description || typeof description !== 'string' || !description.trim()) {
        return NextResponse.json(
          { success: false, error: 'Product Description is required to publish a product.' },
          { status: 400 }
        );
      }

      if (!Array.isArray(images) || images.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one product image is required to publish a product.' },
          { status: 400 }
        );
      }
    }

    // 4. Department Resolution & Validation
    const VALID_DEPTS = new Set(['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES']);
    let resolvedDept = body.department;
    if (!resolvedDept) {
      if (productType === 'accessories') resolvedDept = 'ACCESSORIES';
      else if (gender === 'MEN') resolvedDept = 'MEN';
      else if (gender === 'WOMEN') resolvedDept = 'WOMEN';
      else resolvedDept = 'UNISEX';
    }

    if (!VALID_DEPTS.has(resolvedDept)) {
      return NextResponse.json(
        { success: false, error: `Invalid department: "${resolvedDept}". Supported departments are Men, Women, Unisex, Accessories.` },
        { status: 400 }
      );
    }

    // Align legacy gender and productType with department
    let resolvedGender = gender;
    let resolvedProductType = productType;
    if (resolvedDept === 'ACCESSORIES') {
      resolvedProductType = 'accessories';
      resolvedGender = 'UNISEX';
    } else if (resolvedDept === 'MEN') {
      resolvedGender = 'MEN';
      resolvedProductType = 'clothing';
    } else if (resolvedDept === 'WOMEN') {
      resolvedGender = 'WOMEN';
      resolvedProductType = 'clothing';
    } else if (resolvedDept === 'UNISEX') {
      resolvedGender = 'UNISEX';
      resolvedProductType = 'clothing';
    }

    // 5. Category Resolution and Department Association Validation
    let categoryDoc = null;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryDoc = await Category.findById(category);
    } else if (typeof category === 'string') {
      categoryDoc = await Category.findOne({ slug: category.toLowerCase().trim() });
    }

    if (!categoryDoc) {
      return NextResponse.json(
        { success: false, error: `Invalid category: "${category}" was not found.` },
        { status: 400 }
      );
    }

    if (!categoryDoc.isActive) {
      return NextResponse.json(
        { success: false, error: `Category "${categoryDoc.name}" is currently inactive.` },
        { status: 400 }
      );
    }

    const catDepts: string[] = Array.isArray(categoryDoc.departments) && categoryDoc.departments.length > 0
      ? categoryDoc.departments
      : ['UNISEX'];

    if (!catDepts.includes(resolvedDept)) {
      return NextResponse.json(
        {
          success: false,
          error: `Category "${categoryDoc.name}" does not belong to the "${resolvedDept}" department. (Allowed departments: ${catDepts.join(', ')})`,
        },
        { status: 400 }
      );
    }

    const categoryId = categoryDoc._id;

    // 6. Collection Validation (if supplied)
    let validatedCollectionId: mongoose.Types.ObjectId | undefined = undefined;
    if (collectionId && typeof collectionId === 'string' && collectionId.trim() !== '') {
      if (!mongoose.Types.ObjectId.isValid(collectionId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid Collection ID provided.' },
          { status: 400 }
        );
      }

      const { Collection } = await import('@/server/models/Collection');
      const collectionDoc = await Collection.findById(collectionId);
      if (!collectionDoc) {
        return NextResponse.json(
          { success: false, error: 'Selected Collection was not found.' },
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

      if (!colDepts.includes(resolvedDept)) {
        return NextResponse.json(
          {
            success: false,
            error: `Collection "${collectionDoc.title}" is not valid for department "${resolvedDept}". (Allowed: ${colDepts.join(', ')})`,
          },
          { status: 400 }
        );
      }

      if (Array.isArray(collectionDoc.categories) && collectionDoc.categories.length > 0) {
        const hasCategory = collectionDoc.categories.some(
          (catRef: any) => String(catRef) === String(categoryId)
        );
        if (!hasCategory) {
          return NextResponse.json(
            {
              success: false,
              error: `Collection "${collectionDoc.title}" is not valid for category "${categoryDoc.name}".`,
            },
            { status: 400 }
          );
        }
      }

      validatedCollectionId = collectionDoc._id as mongoose.Types.ObjectId;
    }

    // 5. Collision-Free Slug Generation
    let baseSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!baseSlug) baseSlug = `product-${Date.now().toString(36)}`;

    let uniqueSlug = baseSlug;
    let slugCounter = 1;
    while (await Product.exists({ slug: uniqueSlug })) {
      uniqueSlug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // 6. Collision-Free Primary SKU Generation
    const rawSku = (sku || `AVZ-${uniqueSlug.substring(0, 8).toUpperCase()}-${Date.now().toString(36).substring(4)}`).toUpperCase();
    let uniqueSku = rawSku;
    let skuCounter = 1;
    while (await Product.exists({ sku: uniqueSku })) {
      uniqueSku = `${rawSku}-${skuCounter}`;
      skuCounter++;
    }

    // 7. Format Images
    const rawImages = Array.isArray(images) && images.length > 0 ? images : ['/images/placeholder.jpg'];
    const formattedImages = rawImages.map((img: any, idx: number) => {
      if (typeof img === 'string') {
        return {
          url: img,
          alt: `${title.trim()} - View ${idx + 1}`,
          isPrimary: idx === 0,
          sortOrder: idx,
        };
      }
      return {
        url: img.url || '/images/placeholder.jpg',
        alt: img.alt || `${title.trim()} - View ${idx + 1}`,
        isPrimary: img.isPrimary ?? idx === 0,
        sortOrder: img.sortOrder ?? idx,
      };
    });

    // Ensure at least one image is marked isPrimary
    if (!formattedImages.some((img) => img.isPrimary) && formattedImages.length > 0) {
      formattedImages[0].isPrimary = true;
    }

    // 8. Variants Processing and Duplicate SKU Prevention
    let processedVariants: any[] = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const seenSkus = new Set<string>();
      for (const v of variants) {
        const vSize = String(v.size || 'ONESIZE').trim().toUpperCase();
        const vColor = String(v.color || 'Default').trim();
        const vStock = Math.max(0, parseInt(String(v.stock), 10) || 0);
        let vSku = String(v.sku || `${uniqueSku}-${vSize}-${vColor.substring(0, 3).toUpperCase()}`).trim().toUpperCase();

        // Enforce uniqueness within variant set
        if (seenSkus.has(vSku)) {
          vSku = `${vSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
        seenSkus.add(vSku);

        processedVariants.push({
          sku: vSku,
          size: vSize,
          color: vColor,
          colorHex: v.colorHex || '#0A0A0A',
          stock: vStock,
          reservedStock: 0,
          barcode: v.barcode || undefined,
        });
      }
    } else {
      // Default fallback variant
      processedVariants = [
        {
          sku: `${uniqueSku}-ONE`,
          size: 'ONESIZE',
          color: 'Default',
          colorHex: '#0A0A0A',
          stock: 10,
          reservedStock: 0,
        },
      ];
    }

    // 9. Create Product in MongoDB
    const newProduct = await Product.create({
      title: title.trim(),
      slug: uniqueSlug,
      sku: uniqueSku,
      description: (description || '').trim(),
      gender: resolvedGender,
      department: resolvedDept,
      category: categoryId,
      subCategory: subCategory && mongoose.Types.ObjectId.isValid(subCategory) ? subCategory : undefined,
      collectionId: validatedCollectionId,
      basePrice: parsedBasePrice,
      salePrice: parsedSalePrice,
      costPrice: parsedCostPrice,
      productType: resolvedProductType,
      lowStockThreshold: Math.max(1, parseInt(String(lowStockThreshold), 10) || 5),
      bundleDetails: bundleDetails ? String(bundleDetails).trim() : undefined,
      images: formattedImages,
      variants: processedVariants,
      attributes: attributes && typeof attributes === 'object' ? attributes : {},
      tags: Array.isArray(tags) ? tags.map((t: string) => String(t).trim().toLowerCase()).filter(Boolean) : [],
      status: isPublishing ? 'PUBLISHED' : 'DRAFT',
      isFeatured: Boolean(isFeatured),
      isBestSeller: Boolean(isBestSeller),
      isNewArrival: Boolean(isNewArrival),
      isAveezOriginal: Boolean(isAveezOriginal),
      accessoryType: accessoryType || undefined,
      matchingColors: Array.isArray(matchingColors) ? matchingColors : [],
      metaTitle: metaTitle ? String(metaTitle).trim() : undefined,
      metaDescription: metaDescription ? String(metaDescription).trim() : undefined,
    });

    // 10. If validatedCollectionId specified, link product to Collection
    if (validatedCollectionId) {
      try {
        const { Collection } = await import('@/server/models/Collection');
        await Collection.findByIdAndUpdate(validatedCollectionId, {
          $addToSet: { products: newProduct._id },
        });
      } catch (colErr) {
        console.warn('[ProductsAPI] Failed to attach product to collection:', colErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: isPublishing ? 'Product published successfully to catalog.' : 'Product saved as draft.',
      data: newProduct,
    });
  } catch (error: any) {
    console.error('[ProductsAPI] Error creating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product.' },
      { status: 500 }
    );
  }
}

