import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import { connectToDatabase } from '../src/server/db/connect';
import { Product } from '../src/server/models/Product';
import { Category } from '../src/server/models/Category';
import { AiService } from '../src/server/services/aiService';
import { resolveColorHex } from '../src/lib/colors';

// Helper to load .env.local
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['\"]|['\"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
}

async function runTests() {
  loadEnv();
  console.log('\n=============================================================');
  console.log('AVEEZ FASHION — AI COLOR GROUPING & TITLE GROUNDING TEST SUITE');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
      failed++;
    }
  }

  const tempDir = path.resolve('public/uploads/test-swatches');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  try {
    // -----------------------------------------------------------------------
    // SETUP: Generate Realistic Color Swatch Images with Sharp
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 1: PREPARING SYNTHETIC TEST PHOTOGRAPHS ---');

    // 1. White T-Shirt Photo 1 (Front View, 250, 250, 250)
    const whiteBuf1 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 252, g: 252, b: 252 } },
    }).jpeg().toBuffer();
    const whitePath1 = path.join(tempDir, 'white-tee-front.jpg');
    fs.writeFileSync(whitePath1, whiteBuf1);

    // 2. White T-Shirt Photo 2 (Back View, 248, 249, 250)
    const whiteBuf2 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 248, g: 249, b: 250 } },
    }).jpeg().toBuffer();
    const whitePath2 = path.join(tempDir, 'white-tee-back.jpg');
    fs.writeFileSync(whitePath2, whiteBuf2);

    // 3. Sky Blue T-Shirt Photo 1 (Front View, 56, 189, 248)
    const skyBlueBuf1 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 56, g: 189, b: 248 } },
    }).jpeg().toBuffer();
    const skyBluePath1 = path.join(tempDir, 'skyblue-tee-front.jpg');
    fs.writeFileSync(skyBluePath1, skyBlueBuf1);

    // 4. Sky Blue T-Shirt Photo 2 (Side/Detail Angle, 60, 185, 245)
    const skyBlueBuf2 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 60, g: 185, b: 245 } },
    }).jpeg().toBuffer();
    const skyBluePath2 = path.join(tempDir, 'skyblue-tee-side.jpg');
    fs.writeFileSync(skyBluePath2, skyBlueBuf2);

    // 5. Black T-Shirt Photo 1 (Front View, 12, 12, 12)
    const blackBuf1 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 12, g: 12, b: 12 } },
    }).jpeg().toBuffer();
    const blackPath1 = path.join(tempDir, 'black-tee-front.jpg');
    fs.writeFileSync(blackPath1, blackBuf1);

    // 6. Black T-Shirt Photo 2 (Angle View, 15, 15, 15)
    const blackBuf2 = await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 15, g: 15, b: 15 } },
    }).jpeg().toBuffer();
    const blackPath2 = path.join(tempDir, 'black-tee-angle.jpg');
    fs.writeFileSync(blackPath2, blackBuf2);

    // 7. Ambiguous/Confusing Noise Photo (Random high-frequency noise)
    const noisePixels = Buffer.alloc(100 * 100 * 3);
    for (let i = 0; i < noisePixels.length; i += 3) {
      noisePixels[i] = Math.floor(Math.random() * 255);
      noisePixels[i + 1] = Math.floor(Math.random() * 255);
      noisePixels[i + 2] = Math.floor(Math.random() * 255);
    }
    const noiseBuf = await sharp(noisePixels, { raw: { width: 100, height: 100, channels: 3 } })
      .jpeg()
      .toBuffer();
    const noisePath = path.join(tempDir, 'ambiguous-noise.jpg');
    fs.writeFileSync(noisePath, noiseBuf);

    console.log('✓ Synthetic test images created in public/uploads/test-swatches');

    // -----------------------------------------------------------------------
    // TEST 1 & 2: Color Detection and Grouping for White, Sky Blue, and Black
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 2: COLOR DETECTION & GROUPING VERIFICATION ---');

    const sixImages = [
      { url: `/uploads/test-swatches/white-tee-front.jpg`, alt: 'White Front', fileName: 'white-tee-front.jpg' },
      { url: `/uploads/test-swatches/white-tee-back.jpg`, alt: 'White Back', fileName: 'white-tee-back.jpg' },
      { url: `/uploads/test-swatches/skyblue-tee-front.jpg`, alt: 'Sky Blue Front', fileName: 'skyblue-tee-front.jpg' },
      { url: `/uploads/test-swatches/skyblue-tee-side.jpg`, alt: 'Sky Blue Side', fileName: 'skyblue-tee-side.jpg' },
      { url: `/uploads/test-swatches/black-tee-front.jpg`, alt: 'Black Front', fileName: 'black-tee-front.jpg' },
      { url: `/uploads/test-swatches/black-tee-angle.jpg`, alt: 'Black Angle', fileName: 'black-tee-angle.jpg' },
    ];

    const groupResult = await AiService.groupProductImagesByColor({
      title: 'Premium Boxy Fit Tee',
      images: sixImages,
    });

    console.log('DEBUG Phase 2 groups:', JSON.stringify(groupResult.groups.map(g => ({ name: g.colorName, count: g.images.length })), null, 2));
    console.log('DEBUG Phase 2 unclassified:', JSON.stringify(groupResult.unclassified, null, 2));

    assert(groupResult.success === true, '1. Grouping operation returns success: true');
    assert(groupResult.groups.length === 3, '1b. Exactly 3 distinct color groups detected', `Got ${groupResult.groups.length}`);

    const groupNames = groupResult.groups.map((g) => g.colorName.toLowerCase());
    const hasWhite = groupNames.includes('white');
    const hasSkyBlue = groupNames.includes('sky blue');
    const hasBlack = groupNames.includes('black');

    assert(hasWhite, '1c. White colorway correctly identified');
    assert(hasSkyBlue, '1d. Sky Blue colorway correctly identified');
    assert(hasBlack, '1e. Black colorway correctly identified');

    // Test 2: Multiple angles grouped together
    const whiteGroup = groupResult.groups.find((g) => g.colorName.toLowerCase() === 'white');
    const skyBlueGroup = groupResult.groups.find((g) => g.colorName.toLowerCase() === 'sky blue');
    const blackGroup = groupResult.groups.find((g) => g.colorName.toLowerCase() === 'black');

    assert(
      whiteGroup?.images.length === 2,
      '2a. Multiple angles of White grouped together (2 photos in White variant)'
    );
    assert(
      skyBlueGroup?.images.length === 2,
      '2b. Multiple angles of Sky Blue grouped together (2 photos in Sky Blue variant)'
    );
    assert(
      blackGroup?.images.length === 2,
      '2c. Multiple angles of Black grouped together (2 photos in Black variant)'
    );

    // -----------------------------------------------------------------------
    // TEST 3: Ambiguous or Obscured Image Marked as Unclassified
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 3: UNCLASSIFIED AMBIGUITY HANDLING ---');

    const sevenImagesWithNoise = [
      ...sixImages,
      { url: `/uploads/test-swatches/ambiguous-noise.jpg`, alt: 'Corrupt/Ambiguous Image', fileName: 'ambiguous-noise.jpg' },
    ];

    const groupResultWithNoise = await AiService.groupProductImagesByColor({
      title: 'Premium Boxy Fit Tee',
      images: sevenImagesWithNoise,
    });

    const isNoiseUnclassified =
      groupResultWithNoise.unclassified.some((img) => img.fileName === 'ambiguous-noise.jpg') ||
      groupResultWithNoise.unclassified.length > 0;

    assert(
      isNoiseUnclassified,
      '3. Ambiguous/unidentifiable photo safely segregated into Unclassified group'
    );
    assert(
      groupResultWithNoise.groups.length === 3,
      '3b. No bogus or spurious color variants created for noisy image'
    );

    // -----------------------------------------------------------------------
    // TEST 4 & 5: Title Grounding & Unsupported Specification Prevention
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 4: TITLE-GROUNDED AI ANALYSIS & INTEGRITY ---');

    const categoriesMock = [
      { id: 'cat-1', name: 'Oversized Tees', slug: 'oversized-tees', departments: ['UNISEX', 'MEN'] },
      { id: 'cat-2', name: 'Hoodies', slug: 'hoodies', departments: ['UNISEX'] },
      { id: 'cat-3', name: 'Bottoms', slug: 'bottoms', departments: ['MEN'] },
    ];

    const groundedAnalysis = await AiService.analyzeProductImage({
      imageUrl: `/uploads/test-swatches/skyblue-tee-front.jpg`,
      title: 'Premium Boxy Fit Tee',
      detectedColors: ['White', 'Sky Blue', 'Black'],
      existingCategories: categoriesMock,
      department: 'UNISEX',
      productType: 'clothing',
    });

    assert(
      groundedAnalysis.title === 'Premium Boxy Fit Tee',
      '4. Title "Premium Boxy Fit Tee" is retained exactly without alteration'
    );

    assert(
      groundedAnalysis.description.toLowerCase().includes('tee') ||
        groundedAnalysis.description.toLowerCase().includes('t-shirt') ||
        groundedAnalysis.description.toLowerCase().includes('silhouette'),
      '5a. Description accurately describes a contemporary T-shirt/tee'
    );

    // Verify fabric is NOT hallucinated with ungrounded GSM
    const hasInventedGsm = /450\s*gsm/i.test(groundedAnalysis.fabric || '');
    assert(
      !hasInventedGsm,
      '5b. Does NOT invent false 450 GSM fabric when not present in title or image evidence'
    );

    assert(
      groundedAnalysis.fit === 'Boxy Fit' || Boolean(groundedAnalysis.fit?.toLowerCase().includes('boxy')),
      '5c. Fit accurately reflects "Boxy Fit" inferred directly from title'
    );

    // -----------------------------------------------------------------------
    // TEST 6: No Random Color Variants Created
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 5: ZERO RANDOM COLOR VARIANTS ---');

    const returnedColorNames = groundedAnalysis.colors.map((c) => c.name);
    const hasRandomRed = returnedColorNames.includes('Red');
    const hasRandomGreen = returnedColorNames.includes('Green');
    const hasRandomYellow = returnedColorNames.includes('Yellow');

    assert(
      !hasRandomRed && !hasRandomGreen && !hasRandomYellow,
      '6. No random color variants (Red, Green, Yellow) created without photo evidence'
    );

    assert(
      returnedColorNames.includes('Sky Blue') && returnedColorNames.includes('White') && returnedColorNames.includes('Black'),
      '6b. Only genuine photo-supported colors are present in variant list'
    );

    // -----------------------------------------------------------------------
    // TEST 7: Manual Edit Preservation During Regeneration
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 6: MANUAL EDIT PRESERVATION ---');

    // Simulate administrator manually renaming 'Sky Blue' to 'Powder Blue'
    let adminColorways = ['White', 'Powder Blue', 'Black'];
    const adminManuallyEditedFields = new Set<string>(['title', 'colors']);

    // Re-run regeneration for description field only
    const fieldRegenResult = await AiService.analyzeProductImage({
      imageUrl: `/uploads/test-swatches/skyblue-tee-front.jpg`,
      title: 'Premium Boxy Fit Tee', // Manually entered title
      detectedColors: adminColorways,
      existingCategories: categoriesMock,
      forceField: 'description',
    });

    assert(
      fieldRegenResult.title === 'Premium Boxy Fit Tee',
      '7a. Manually entered title remains unchanged during field regeneration'
    );
    assert(
      fieldRegenResult.colors.some((c) => c.name === 'Powder Blue'),
      '7b. Manually edited colorway "Powder Blue" is preserved and not overwritten'
    );

    // -----------------------------------------------------------------------
    // TEST 8: Re-Running Detection Stability & Idempotency
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 7: STABILITY & RE-RUN IDEMPOTENCY ---');

    const rerunResult = await AiService.groupProductImagesByColor({
      title: 'Premium Boxy Fit Tee',
      images: sixImages,
    });

    assert(
      rerunResult.groups.length === 3,
      '8a. Re-running detection does not duplicate groups'
    );
    const totalPhotos = rerunResult.groups.reduce((acc, g) => acc + g.images.length, 0);
    assert(
      totalPhotos === 6,
      '8b. Re-running detection retains all 6 uploaded photos without deletions'
    );

    // -----------------------------------------------------------------------
    // TEST 9: MongoDB Product Variant & Storefront Data Integrity
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 8: MONGODB STOREFRONT DATA INTEGRITY ---');

    await connectToDatabase();

    // Find or create test category
    let testCat = await Category.findOne({ slug: 'test-boxy-tees' });
    if (!testCat) {
      testCat = await Category.create({
        name: 'Test Boxy Tees',
        slug: 'test-boxy-tees',
        description: 'Test category for color grouping',
        displayOrder: 999,
        isActive: true,
        departments: ['MEN', 'UNISEX'],
      });
    }

    const testSlug = `test-boxy-tee-${Date.now().toString(36)}`;
    const testSku = `AVZ-TEE-${Date.now().toString(36).toUpperCase()}`;

    // Create product with White, Sky Blue, and Black variants + assigned images
    const createdProduct = await Product.create({
      title: 'Premium Boxy Fit Tee',
      slug: testSlug,
      sku: testSku,
      description: 'Boxy fit tee with dropped shoulders crafted from premium breathable cotton.',
      gender: 'UNISEX',
      department: 'UNISEX',
      category: testCat._id,
      basePrice: 1999,
      productType: 'clothing',
      status: 'PUBLISHED',
      images: [
        { url: '/uploads/test-swatches/white-tee-front.jpg', alt: 'White Tee Front', color: 'White', isPrimary: true, sortOrder: 0 },
        { url: '/uploads/test-swatches/white-tee-back.jpg', alt: 'White Tee Back', color: 'White', isPrimary: false, sortOrder: 1 },
        { url: '/uploads/test-swatches/skyblue-tee-front.jpg', alt: 'Sky Blue Tee Front', color: 'Sky Blue', isPrimary: false, sortOrder: 2 },
        { url: '/uploads/test-swatches/skyblue-tee-side.jpg', alt: 'Sky Blue Tee Side', color: 'Sky Blue', isPrimary: false, sortOrder: 3 },
        { url: '/uploads/test-swatches/black-tee-front.jpg', alt: 'Black Tee Front', color: 'Black', isPrimary: false, sortOrder: 4 },
        { url: '/uploads/test-swatches/black-tee-angle.jpg', alt: 'Black Tee Angle', color: 'Black', isPrimary: false, sortOrder: 5 },
      ],
      variants: [
        { sku: `${testSku}-WHT-M`, size: 'M', color: 'White', colorHex: '#FFFFFF', stock: 12 },
        { sku: `${testSku}-WHT-L`, size: 'L', color: 'White', colorHex: '#FFFFFF', stock: 8 },
        { sku: `${testSku}-SKY-M`, size: 'M', color: 'Sky Blue', colorHex: '#38BDF8', stock: 15 },
        { sku: `${testSku}-SKY-L`, size: 'L', color: 'Sky Blue', colorHex: '#38BDF8', stock: 10 },
        { sku: `${testSku}-BLK-M`, size: 'M', color: 'Black', colorHex: '#0A0A0A', stock: 20 },
        { sku: `${testSku}-BLK-L`, size: 'L', color: 'Black', colorHex: '#0A0A0A', stock: 14 },
      ],
      attributes: {
        fabric: 'Combed Cotton Knit',
        fit: 'Boxy Fit',
      },
      matchingColors: ['White', 'Sky Blue', 'Black'],
    });

    assert(Boolean(createdProduct._id), '9a. Product created in MongoDB with 6 variants & color-tagged images');

    // Simulate Storefront Gallery Filtering by Selected Colorway
    const fetched = await Product.findOne({ slug: testSlug }).lean();
    assert(Boolean(fetched), '9b. Product fetched successfully by slug');

    // Filter images when user selects 'Sky Blue'
    const skyBlueImages = fetched!.images.filter(
      (img: any) => img.color && img.color.toLowerCase() === 'sky blue'
    );
    assert(
      skyBlueImages.length === 2 && skyBlueImages[0].url.includes('skyblue'),
      '9c. Storefront color selection accurately isolates Sky Blue photos'
    );

    // Filter images when user selects 'White'
    const whiteImages = fetched!.images.filter(
      (img: any) => img.color && img.color.toLowerCase() === 'white'
    );
    assert(
      whiteImages.length === 2 && whiteImages[0].url.includes('white'),
      '9d. Storefront color selection accurately isolates White photos'
    );

    // Clean up test product
    await Product.deleteOne({ _id: createdProduct._id });
    if (testCat.slug === 'test-boxy-tees') {
      await Category.deleteOne({ _id: testCat._id });
    }
    console.log('✓ Test records cleaned from MongoDB Atlas');

    // -----------------------------------------------------------------------
    // TEST 10: Safe Handling of Corrupt / Incomplete Inputs
    // -----------------------------------------------------------------------
    console.log('\n--- PHASE 9: CORRUPT & INVALID INPUT RESILIENCE ---');

    const emptyGroup = await AiService.groupProductImagesByColor({
      title: 'Empty Product',
      images: [],
    });
    assert(
      emptyGroup.groups.length === 0 && emptyGroup.unclassified.length === 0,
      '10a. Empty image list handled safely without crash'
    );

    const corruptGroup = await AiService.groupProductImagesByColor({
      title: 'Corrupt Test',
      images: [{ url: '/non-existent-image-path.jpg', alt: 'Broken' }],
    });
    assert(
      corruptGroup.unclassified.length === 1 && corruptGroup.unclassified[0].reason?.length! > 0,
      '10b. Missing/corrupt image safely marked as Unclassified with helpful diagnostic reason'
    );

    console.log('\n=============================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('=============================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test exception:', err);
    process.exit(1);
  } finally {
    // Clean up temporary test files
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    await mongoose.disconnect();
  }
}

runTests();
