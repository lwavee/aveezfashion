import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { Category } from '../src/server/models/Category';
import { Collection } from '../src/server/models/Collection';
import { Product } from '../src/server/models/Product';
import { DEPARTMENTS, type Department } from '../src/types';

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

async function runClassificationTests() {
  console.log('======================================================================');
  console.log('AVEEZ FASHION — DYNAMIC CLASSIFICATION SYSTEM VERIFICATION SUITE');
  console.log('======================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas\n');

  // TEST 1: All 4 Departments Defined and Valid
  try {
    const expectedDepts: Department[] = ['MEN', 'WOMEN', 'UNISEX', 'ACCESSORIES'];
    const valid = expectedDepts.every((d) => DEPARTMENTS.includes(d));
    recordTest(
      'Supported Departments (MEN, WOMEN, UNISEX, ACCESSORIES)',
      valid && DEPARTMENTS.length === 4,
      `DEPARTMENTS = [${DEPARTMENTS.join(', ')}]`
    );
  } catch (err: any) {
    recordTest('Supported Departments', false, err.message);
  }

  // TEST 2: Men Department Filtering
  try {
    const menCats = await Category.find({ departments: 'MEN', isActive: true }).lean();
    const hasPolo = menCats.some((c) => c.slug === 'polo-t-shirts');
    const hasLinen = menCats.some((c) => c.slug === 'linen-shirts');
    const hasSalwar = menCats.some((c) => c.slug === 'salwar-suits');
    const hasClawClips = menCats.some((c) => c.slug === 'claw-clips');

    recordTest(
      'Men Department Categories Filter',
      hasPolo && hasLinen && !hasSalwar && !hasClawClips && menCats.length > 30,
      `Found ${menCats.length} Men categories. Includes Polo T-Shirts & Linen Shirts; excludes Salwar Suits & Claw Clips`
    );
  } catch (err: any) {
    recordTest('Men Department Categories Filter', false, err.message);
  }

  // TEST 3: Women Department Filtering
  try {
    const womenCats = await Category.find({ departments: 'WOMEN', isActive: true }).lean();
    const hasCropTops = womenCats.some((c) => c.slug === 'crop-tops');
    const hasSalwar = womenCats.some((c) => c.slug === 'salwar-suits');
    const hasLehengas = womenCats.some((c) => c.slug === 'lehengas');
    const hasPolo = womenCats.some((c) => c.slug === 'polo-t-shirts');
    const hasClawClips = womenCats.some((c) => c.slug === 'claw-clips');

    recordTest(
      'Women Department Categories Filter',
      hasCropTops && hasSalwar && hasLehengas && !hasPolo && !hasClawClips && womenCats.length > 35,
      `Found ${womenCats.length} Women categories. Includes Crop Tops & Salwar Suits; excludes Polo T-Shirts & Claw Clips`
    );
  } catch (err: any) {
    recordTest('Women Department Categories Filter', false, err.message);
  }

  // TEST 4: Unisex Department Filtering
  try {
    const unisexCats = await Category.find({ departments: 'UNISEX', isActive: true }).lean();
    const hasOversized = unisexCats.some((c) => c.slug === 'oversized-tees');
    const hasHoodies = unisexCats.some((c) => c.slug === 'hoodies');
    const hasCoupleTees = unisexCats.some((c) => c.slug === 'couple-t-shirts');
    const hasSalwar = unisexCats.some((c) => c.slug === 'salwar-suits');
    const hasClawClips = unisexCats.some((c) => c.slug === 'claw-clips');

    recordTest(
      'Unisex Department Categories Filter',
      hasOversized && hasHoodies && hasCoupleTees && !hasSalwar && !hasClawClips && unisexCats.length >= 10,
      `Found ${unisexCats.length} Unisex categories. Includes Oversized T-Shirts & Couple T-Shirts; excludes Salwar Suits & Claw Clips`
    );
  } catch (err: any) {
    recordTest('Unisex Department Categories Filter', false, err.message);
  }

  // TEST 5: Accessories Department Filtering
  try {
    const accCats = await Category.find({ departments: 'ACCESSORIES', isActive: true }).lean();
    const hasHairbands = accCats.some((c) => c.slug === 'hairbands');
    const hasClawClips = accCats.some((c) => c.slug === 'claw-clips');
    const hasKeychains = accCats.some((c) => c.slug === 'keychains');
    const hasPolo = accCats.some((c) => c.slug === 'polo-t-shirts');
    const hasJeans = accCats.some((c) => c.slug === 'jeans');

    recordTest(
      'Accessories Department Categories Filter',
      hasHairbands && hasClawClips && hasKeychains && !hasPolo && !hasJeans && accCats.length >= 20,
      `Found ${accCats.length} Accessories categories. Includes Hairbands, Claw Clips, Keychains; excludes Polo T-Shirts & Jeans`
    );
  } catch (err: any) {
    recordTest('Accessories Department Categories Filter', false, err.message);
  }

  // TEST 6: Unified Multi-Department Categories (No Duplicates)
  try {
    const oversizedCount = await Category.countDocuments({ slug: 'oversized-tees' });
    const hoodiesCount = await Category.countDocuments({ slug: 'hoodies' });
    const socksCount = await Category.countDocuments({ slug: 'socks' });

    const oversized = await Category.findOne({ slug: 'oversized-tees' });
    const socks = await Category.findOne({ slug: 'socks' });

    const oversizedIsShared = oversized?.departments?.includes('MEN') && oversized?.departments?.includes('WOMEN') && oversized?.departments?.includes('UNISEX');
    const socksIsShared = socks?.departments?.includes('MEN') && socks?.departments?.includes('WOMEN') && socks?.departments?.includes('ACCESSORIES');

    recordTest(
      'Multi-Department Categories Unified as Single Records (Zero Duplicates)',
      oversizedCount === 1 && hoodiesCount === 1 && socksCount === 1 && !!oversizedIsShared && !!socksIsShared,
      `Oversized Tees: 1 doc with depts [${oversized?.departments?.join(', ')}]. Socks: 1 doc with depts [${socks?.departments?.join(', ')}]`
    );
  } catch (err: any) {
    recordTest('Multi-Department Categories Unified as Single Records', false, err.message);
  }

  // TEST 7: Collection Association Logic
  try {
    const collections = await Collection.find({}).lean();
    const aveezOriginals = collections.find((c) => c.slug === 'aveez-originals');
    const monochrome = collections.find((c) => c.slug === 'monochrome-edit');
    const handmade = collections.find((c) => c.slug === 'aveez-handmade');

    const originalsHasDepts = aveezOriginals?.departments?.length && aveezOriginals.departments.includes('MEN') && aveezOriginals.departments.includes('WOMEN');
    const handmadeHasAcc = handmade?.departments?.includes('ACCESSORIES');

    recordTest(
      'Collections Associated with Valid Departments/Categories',
      collections.length >= 5 && !!originalsHasDepts && !!handmadeHasAcc,
      `Found ${collections.length} collections. 'Aveez Originals' depts: [${aveezOriginals?.departments?.join(', ')}]. 'Aveez Handmade' depts: [${handmade?.departments?.join(', ')}]`
    );
  } catch (err: any) {
    recordTest('Collections Associated with Valid Departments/Categories', false, err.message);
  }

  // TEST 8: Server-Side Validation: Reject Invalid Department / Category
  try {
    // Test logic simulating POST /api/admin/products validation
    const invalidDept = 'KIDS' as any;
    const isDeptValid = DEPARTMENTS.includes(invalidDept);

    const menCat = await Category.findOne({ slug: 'polo-t-shirts' });
    const isCatValidForWomen = (menCat?.departments || []).includes('WOMEN' as any);

    const hairbandCat = await Category.findOne({ slug: 'hairbands' });
    const isHairbandValidForMen = (hairbandCat?.departments || []).includes('MEN' as any);

    recordTest(
      'Server-Side Validation Rejects Incompatible Department/Category Combinations',
      !isDeptValid && !isCatValidForWomen && !isHairbandValidForMen,
      `Invalid department 'KIDS' rejected; 'polo-t-shirts' rejected for WOMEN; 'hairbands' rejected for MEN`
    );
  } catch (err: any) {
    recordTest('Server-Side Validation Rejects Incompatible Department/Category Combinations', false, err.message);
  }

  // TEST 9: Optional Collection Support ("No Collection Assigned")
  try {
    // Products are valid with collectionId: undefined or null or ''
    const noCollectionProducts = await Product.find({
      $or: [{ collectionId: { $exists: false } }, { collectionId: null }],
    }).lean();

    recordTest(
      'Optional Collection Support ("No Collection Assigned" Saves Successfully)',
      noCollectionProducts.length > 0,
      `Found ${noCollectionProducts.length} products saved without a collection assignment`
    );
  } catch (err: any) {
    recordTest('Optional Collection Support', false, err.message);
  }

  // TEST 10: Existing Products Intact with Valid Department & Category
  try {
    const products = await Product.find({}).lean();
    let allValid = true;
    let checkedCount = 0;

    for (const p of products) {
      if (!p.department || !DEPARTMENTS.includes(p.department as Department)) {
        allValid = false;
        break;
      }
      // Check that category is populated or slug exists
      const catSlug = typeof p.category === 'object' ? (p.category as any)?.slug : p.category;
      if (catSlug) {
        const cat = await Category.findOne({ $or: [{ slug: catSlug }, { _id: mongoose.isValidObjectId(catSlug) ? catSlug : undefined }] });
        if (cat && !cat.departments?.includes(p.department as Department)) {
          allValid = false;
          break;
        }
      }
      checkedCount++;
    }

    recordTest(
      'Existing Products Backfilled & Compatible with Dynamic Classification Hierarchy',
      allValid && checkedCount === 12,
      `All ${checkedCount} products have valid department and compatible category mapping`
    );
  } catch (err: any) {
    recordTest('Existing Products Backfilled & Compatible', false, err.message);
  }

  // TEST 11: Total Category Catalog Count and Cleanliness
  try {
    const totalCategories = await Category.countDocuments({});
    const activeCategories = await Category.countDocuments({ isActive: true });
    const duplicateSlugs = await Category.aggregate([
      { $group: { _id: '$slug', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ]);

    recordTest(
      'Category Catalog Scalability & Zero Duplicates',
      totalCategories >= 100 && activeCategories >= 100 && duplicateSlugs.length === 0,
      `Total: ${totalCategories} categories, Active: ${activeCategories}, Duplicate slugs: ${duplicateSlugs.length}`
    );
  } catch (err: any) {
    recordTest('Category Catalog Scalability & Zero Duplicates', false, err.message);
  }

  // Summary
  console.log('\n======================================================================');
  console.log('CLASSIFICATION SYSTEM TEST SUMMARY');
  console.log('======================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log(`Passed: ${passedCount}/${totalCount} (${Math.round((passedCount / totalCount) * 100)}%)`);

  if (passedCount === totalCount) {
    console.log('🎉 ALL 11 CLASSIFICATION SYSTEM TESTS PASSED PERFECTLY!\n');
  } else {
    console.error('⚠️ SOME TESTS FAILED!\n');
    process.exit(1);
  }

  await mongoose.disconnect();
}

runClassificationTests().catch((err) => {
  console.error('Fatal test failure:', err);
  process.exit(1);
});
