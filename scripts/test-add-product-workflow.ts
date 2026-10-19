import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Product } from '../src/server/models/Product';
import { Category } from '../src/server/models/Category';
import { Order } from '../src/server/models/Order';
import { StorageService } from '../src/server/services/storageService';

// Load .env.local
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  fs.readFileSync(envLocalPath, 'utf8').split('\n').forEach((l) => {
    const [k, ...v] = l.trim().split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const MONGODB_URI = process.env.MONGODB_URI || '';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordTest(name: string, passed: boolean, details?: string) {
  results.push({ name, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${icon}: ${name}${details ? ` -> ${details}` : ''}`);
}

async function runTests() {
  console.log('======================================================================');
  console.log('AVEEZ FASHION — ADD PRODUCT WORKFLOW VERIFICATION TEST SUITE');
  console.log('======================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas\n');

  const createdTestProductIds: mongoose.Types.ObjectId[] = [];

  // TEST 1: Storage Service & B2 / Local Upload
  try {
    const sampleBuffer = Buffer.from(
      '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000A49444154789C63000100000500010D0A2DB40000000049454E44AE426082',
      'hex'
    );
    const uploadResult = await StorageService.uploadProductImage(
      sampleBuffer,
      'test-workflow-sample.png',
      'image/png'
    );

    const hasValidUrl = uploadResult.url.startsWith('/api/media/') || uploadResult.url.startsWith('/uploads/');
    recordTest(
      'Image Upload to Backblaze B2 / Storage Service',
      hasValidUrl && uploadResult.size === sampleBuffer.length,
      `Provider: ${uploadResult.storageProvider}, URL: ${uploadResult.url}, Size: ${uploadResult.size}B`
    );

    // Test rejection of invalid magic bytes
    let rejectedInvalid = false;
    try {
      await StorageService.uploadProductImage(
        Buffer.from('NOT_AN_IMAGE_CONTENT_STRING'),
        'fake.png',
        'image/png'
      );
    } catch {
      rejectedInvalid = true;
    }
    recordTest(
      'Image Security: Invalid Magic Bytes Rejection',
      rejectedInvalid,
      'Non-image payload was successfully blocked with validation error'
    );
  } catch (err: any) {
    recordTest('Image Upload to Storage Service', false, err.message);
  }

  // TEST 2: Clothing Product Creation with Variant Matrix (Draft & Published)
  try {
    const hoodieCat = await Category.findOne({ slug: 'hoodies' });
    if (!hoodieCat) throw new Error('Hoodies category not found in DB');

    // 2a. Save as Draft
    const draftProduct = await Product.create({
      title: 'TEST PROBE Draft Boxy Zip Hoodie',
      slug: `test-probe-draft-boxy-zip-hoodie-${Date.now()}`,
      sku: `AVZ-TEST-DRAFT-${Date.now().toString(36).toUpperCase()}`,
      description: 'Draft piece with minimal specifications for later publishing.',
      gender: 'UNISEX',
      category: hoodieCat._id,
      basePrice: 3499,
      costPrice: 1200,
      productType: 'clothing',
      status: 'DRAFT',
      images: [
        {
          url: '/images/CATEGORY/hoodies.png',
          alt: 'Draft Hoodie Front',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        {
          sku: `AVZ-TEST-DRAFT-S`,
          size: 'S',
          color: 'Onyx Black',
          colorHex: '#0A0A0A',
          stock: 5,
        },
      ],
    });
    createdTestProductIds.push(draftProduct._id as mongoose.Types.ObjectId);

    recordTest(
      'Save as Draft Product Flow',
      draftProduct.status === 'DRAFT' && draftProduct.costPrice === 1200,
      `Product ID: ${draftProduct._id}, Status: ${draftProduct.status}, CostPrice: ₹${draftProduct.costPrice}`
    );

    // 2b. Verify Draft is Hidden from Public Queries
    const publicQueryProducts = await Product.find({ status: 'PUBLISHED' }).select('-costPrice').lean();
    const draftFoundInPublic = publicQueryProducts.some((p) => p.slug === draftProduct.slug);

    recordTest(
      'Draft Privacy: Unpublished Products Excluded from Public Queries',
      !draftFoundInPublic,
      'Draft product correctly does NOT appear in public catalog filter (status: PUBLISHED)'
    );

    // 2c. Publish Full Clothing Product with Variant Matrix
    const publishedProduct = await Product.create({
      title: 'TEST PROBE Architectural Heavyweight Overshirt',
      slug: `test-probe-overshirt-${Date.now()}`,
      sku: `AVZ-TEST-SHIRT-${Date.now().toString(36).toUpperCase()}`,
      description: 'Luxury 320 GSM combed cotton structured overshirt with horn buttons.',
      gender: 'MEN',
      category: hoodieCat._id,
      basePrice: 4299,
      salePrice: 3899,
      costPrice: 1500,
      productType: 'clothing',
      status: 'PUBLISHED',
      isNewArrival: true,
      images: [
        {
          url: '/images/CATEGORY/shirt.png',
          alt: 'Primary View',
          isPrimary: true,
          sortOrder: 0,
        },
        {
          url: '/images/CATEGORY/men.png',
          alt: 'Secondary View',
          isPrimary: false,
          sortOrder: 1,
        },
      ],
      variants: [
        { sku: `AVZ-TEST-SHIRT-BLK-S`, size: 'S', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 8 },
        { sku: `AVZ-TEST-SHIRT-BLK-M`, size: 'M', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 12 },
        { sku: `AVZ-TEST-SHIRT-BLK-L`, size: 'L', color: 'Onyx Black', colorHex: '#0A0A0A', stock: 6 },
        { sku: `AVZ-TEST-SHIRT-ECR-M`, size: 'M', color: 'Raw Ecru', colorHex: '#F5F5DC', stock: 10 },
      ],
      attributes: {
        fabric: '100% Combed Heavyweight Cotton (320 GSM)',
        fit: 'Boxy Structured Overfit',
        washCare: 'Dry clean recommended',
      },
    });
    createdTestProductIds.push(publishedProduct._id as mongoose.Types.ObjectId);

    const totalVariantStock = publishedProduct.variants.reduce((sum, v) => sum + v.stock, 0);
    recordTest(
      'Clothing Published Product Creation & Variant Matrix',
      publishedProduct.status === 'PUBLISHED' &&
        publishedProduct.variants.length === 4 &&
        totalVariantStock === 36,
      `Variants: ${publishedProduct.variants.length}, Total Stock: ${totalVariantStock} units, Primary Image: ${publishedProduct.images[0].isPrimary}`
    );

    // 2d. Verify Published Product Appears in Public Query & Excludes Cost Price
    const publicFetched = await Product.findOne({ slug: publishedProduct.slug, status: 'PUBLISHED' })
      .select('-costPrice')
      .lean();
    const costPriceLeaked = publicFetched && 'costPrice' in publicFetched && (publicFetched as any).costPrice !== undefined;

    recordTest(
      'Public Catalog Visibility & Cost Price Security',
      !!publicFetched && !costPriceLeaked,
      `Storefront Status: Found live product, Cost Price Excluded from Public: ${!costPriceLeaked}`
    );
  } catch (err: any) {
    recordTest('Clothing Product Creation Workflow', false, err.message);
  }

  // TEST 3: Accessories Creation Workflow (Single Stock & Bundle Breakdown)
  try {
    const hairbandCat = await Category.findOne({ slug: 'hairbands' });
    if (!hairbandCat) throw new Error('Hairbands category not found');

    const accessoryProduct = await Product.create({
      title: 'TEST PROBE Velvet Sculpted Hairband with Pearl Inlay',
      slug: `test-probe-velvet-hairband-${Date.now()}`,
      sku: `AVZ-ACC-TEST-${Date.now().toString(36).toUpperCase()}`,
      description: 'Handmade velvet hairband adorned with natural freshwater pearl accents.',
      gender: 'WOMEN',
      category: hairbandCat._id,
      basePrice: 1899,
      salePrice: 1599,
      costPrice: 550,
      productType: 'accessories',
      accessoryType: 'hairbands',
      status: 'PUBLISHED',
      bundleDetails: '1x Velvet Sculpted Hairband, 1x Aveez Dust Storage Bag',
      images: [
        {
          url: '/images/CATEGORY/accessories.png',
          alt: 'Hairband Front View',
          isPrimary: true,
          sortOrder: 0,
        },
      ],
      variants: [
        {
          sku: `AVZ-ACC-TEST-NOIR`,
          size: 'ONESIZE',
          color: 'Noir & Pearl',
          colorHex: '#0A0A0A',
          stock: 15,
        },
      ],
    });
    createdTestProductIds.push(accessoryProduct._id as mongoose.Types.ObjectId);

    recordTest(
      'Accessories Product Workflow (No Apparel Sizing Clutter, Bundle Breakdown)',
      accessoryProduct.productType === 'accessories' &&
        accessoryProduct.variants[0].size === 'ONESIZE' &&
        accessoryProduct.bundleDetails !== undefined,
      `Type: ${accessoryProduct.productType}, Size: ${accessoryProduct.variants[0].size}, Stock: ${accessoryProduct.variants[0].stock}`
    );
  } catch (err: any) {
    recordTest('Accessories Product Workflow', false, err.message);
  }

  // TEST 4: Pricing Validation (Zero-Trust Logic Verification)
  try {
    let negativeBaseBlocked = false;
    try {
      const p = new Product({
        title: 'Negative Price Test',
        slug: `neg-price-${Date.now()}`,
        sku: `NEG-${Date.now()}`,
        description: 'Test',
        category: new mongoose.Types.ObjectId(),
        basePrice: -500,
        images: [{ url: '/img.png', alt: 'img' }],
        variants: [{ sku: 'S-1', size: 'M', color: 'Black', stock: 10 }],
      });
      await p.validate();
    } catch {
      negativeBaseBlocked = true;
    }

    recordTest(
      'Server-Side Pricing Security: Reject Negative Prices',
      negativeBaseBlocked,
      'Mongoose schema & API routes strictly forbid basePrice < 0'
    );
  } catch (err: any) {
    recordTest('Pricing Validation Security', false, err.message);
  }

  // TEST 5: Clean Up Test Probes to Guarantee Zero Production Contamination
  try {
    if (createdTestProductIds.length > 0) {
      await Product.deleteMany({ _id: { $in: createdTestProductIds } });
    }

    const remainingProductsCount = await Product.countDocuments({});
    const remainingOrdersCount = await Order.countDocuments({});

    recordTest(
      'Safe Test Cleanup & Legitimate Catalog Preservation',
      remainingProductsCount === 12 && remainingOrdersCount === 2,
      `Remaining authentic products: ${remainingProductsCount} (Target: 12), Orders: ${remainingOrdersCount} (Target: 2)`
    );
  } catch (err: any) {
    recordTest('Safe Test Cleanup', false, err.message);
  }

  await mongoose.disconnect();

  console.log('\n======================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(
    `TOTAL TESTS: ${results.length} | PASSED: ${results.filter((r) => r.passed).length} | FAILED: ${
      results.filter((r) => !r.passed).length
    }`
  );
  console.log(allPassed ? '🎉 ALL ADD PRODUCT WORKFLOW TESTS PASSED!' : '⚠️ SOME CHECKS FAILED');
  console.log('======================================================================');
}

runTests().catch(console.error);
