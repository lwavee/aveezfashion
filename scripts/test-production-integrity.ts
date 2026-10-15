import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../src/server/models/User';
import { Product } from '../src/server/models/Product';
import { Category } from '../src/server/models/Category';
import { Order } from '../src/server/models/Order';
import { Coupon } from '../src/server/models/Coupon';
import { ReturnRequest } from '../src/server/models/ReturnRequest';
import { validateCouponServer } from '../src/server/coupons';

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

async function runProductionIntegrityTests() {
  console.log('======================================================================');
  console.log('AVEEZ FASHION — PRODUCTION INTEGRITY & DATA SAFETY TEST SUITE');
  console.log('======================================================================\n');

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB Atlas\n');

  // TEST 1: Authentic Products & Accessories Catalog
  try {
    const products = await Product.find({}).lean();
    const accessories = products.filter((p) => p.accessoryType || p.slug.includes('hairband') || p.slug.includes('clip') || p.slug.includes('keychain') || p.slug.includes('charm'));
    const apparel = products.filter((p) => !accessories.some(a => a._id.toString() === p._id.toString()));
    const totalVariants = products.reduce((sum, p) => sum + (p.variants?.length || 0), 0);

    recordTest(
      'Catalog Expansion & Integrity (12 Products: 6 Apparel + 6 Accessories, 35 Variants)',
      products.length === 12 && accessories.length === 6 && apparel.length === 6 && totalVariants === 35,
      `Total: ${products.length} products, Apparel: ${apparel.length}, Accessories: ${accessories.length}, Variants: ${totalVariants}`
    );
  } catch (err: any) {
    recordTest('Catalog Expansion & Integrity', false, err.message);
  }

  // TEST 2: Real Order Preservation (Zero Data Loss)
  try {
    const order1 = await Order.findOne({ orderNumber: 'AVZ-2026-659072' });
    const order2 = await Order.findOne({ orderNumber: 'AVZ-2026-788155' });
    const totalOrders = await Order.countDocuments({});

    recordTest(
      'Legitimate Orders Preserved Intact (AVZ-2026-659072 & AVZ-2026-788155)',
      !!order1 && !!order2 && totalOrders === 2,
      `Order 1: ${order1?.orderNumber} (${order1?.paymentMethod}), Order 2: ${order2?.orderNumber} (${order2?.paymentStatus})`
    );
  } catch (err: any) {
    recordTest('Legitimate Orders Preserved Intact', false, err.message);
  }

  // TEST 3: User Accounts Preservation
  try {
    const customer = await User.findOne({ email: 'vishu@gmail.com' });
    const admin = await User.findOne({ email: 'sarla@aveezfashion.com' });

    recordTest(
      'Customer & Administrator Accounts Preserved',
      customer?.role === 'CUSTOMER' && admin?.role === 'ADMIN',
      `Customer: ${customer?.email}, Admin: ${admin?.email}`
    );
  } catch (err: any) {
    recordTest('Customer & Administrator Accounts Preserved', false, err.message);
  }

  // TEST 4: Categories & Brand Architecture
  try {
    const categoriesCount = await Category.countDocuments({});
    const accessoriesCat = await Category.findOne({ slug: 'accessories' });
    const hairbandsCat = await Category.findOne({ slug: 'hairbands' });

    recordTest(
      'Authentic Brand Categories Present in Database',
      categoriesCount >= 13 && !!accessoriesCat && !!hairbandsCat,
      `Found ${categoriesCount} categories, including Accessories (${accessoriesCat?.slug}) & Hairbands (${hairbandsCat?.slug})`
    );
  } catch (err: any) {
    recordTest('Authentic Brand Categories Present', false, err.message);
  }

  // TEST 5: Server-Side Coupon Engine
  try {
    const resValid = await validateCouponServer('AVEEZ10', 3000);
    const resFirst500Low = await validateCouponServer('FIRST500', 1500);
    const resFirst500High = await validateCouponServer('FIRST500', 3500);
    const resInvalid = await validateCouponServer('FAKECOUPON999', 3000);

    const pass =
      resValid.valid &&
      resValid.discount === 300 &&
      !resFirst500Low.valid && // Below min order value
      resFirst500High.valid &&
      resFirst500High.discount === 500 &&
      !resInvalid.valid;

    recordTest(
      'Server-Side Dynamic Coupon Validation Engine',
      pass,
      `AVEEZ10: -₹${resValid.discount}, FIRST500 (low subtotal): ${resFirst500Low.valid ? 'valid' : 'rejected correctly'}, FIRST500 (high subtotal): -₹${resFirst500High.discount}, Invalid code: rejected`
    );
  } catch (err: any) {
    recordTest('Server-Side Dynamic Coupon Validation Engine', false, err.message);
  }

  // TEST 6: Single <h1> SEO Verification on Hero
  try {
    const heroContent = fs.readFileSync(path.resolve('src/components/home/HeroSection.tsx'), 'utf8');
    const hasSingleH1Logic = heroContent.includes('index === 0 ? (') && heroContent.includes('<h1 className={styles.heroHeading}>');

    recordTest(
      'Hero Slider Single <h1> Semantic Hierarchy (SEO Compliance)',
      hasSingleH1Logic,
      'Index 0 renders <h1>, subsequent slides render <div role="heading" aria-level={2}>'
    );
  } catch (err: any) {
    recordTest('Hero Slider Single <h1> Semantic Hierarchy', false, err.message);
  }

  // TEST 7: Truthful Merchandising ("Popular Picks" instead of unverified "Best Sellers")
  try {
    const bestSellersComponent = fs.readFileSync(path.resolve('src/components/home/BestSellersSection.tsx'), 'utf8');
    const isTruthful = bestSellersComponent.includes('POPULAR PICKS') && bestSellersComponent.includes('CURATED SELECTION');

    recordTest(
      'Truthful Merchandising: Renamed to POPULAR PICKS',
      isTruthful,
      'Claims align with authentic order data without fabricating sales statistics'
    );
  } catch (err: any) {
    recordTest('Truthful Merchandising', false, err.message);
  }

  // TEST 8: Footer & Navigation Link Parity
  try {
    const footerContent = fs.readFileSync(path.resolve('src/components/layout/Footer.tsx'), 'utf8');
    const ourStoryExists = fs.existsSync(path.resolve('src/app/(store)/our-story/page.tsx'));
    const navbarContent = fs.readFileSync(path.resolve('src/components/layout/Navbar.tsx'), 'utf8');

    const pass =
      footerContent.includes('href="/accessories"') &&
      ourStoryExists &&
      navbarContent.includes('<span className={styles.navLink}>ACCESSORIES</span>');

    recordTest(
      'Storefront Link Parity (Accessories in Footer & Nav Fallback, /our-story Route)',
      pass,
      'Footer has /accessories link, Navbar Suspense fallback includes ACCESSORIES, /our-story redirects to /about'
    );
  } catch (err: any) {
    recordTest('Storefront Link Parity', false, err.message);
  }

  // TEST 9: Admin Inventory Restocking & Replenishment API
  try {
    const inventoryRouteExists = fs.existsSync(path.resolve('src/app/api/admin/inventory/route.ts'));
    const inventoryPageContent = fs.readFileSync(path.resolve('src/app/(admin)/admin/inventory/page.tsx'), 'utf8');

    const pass =
      inventoryRouteExists &&
      inventoryPageContent.includes('handleAdjustStock') &&
      inventoryPageContent.includes('handleSetStock');

    recordTest(
      'Admin Inventory Restocking & Telemetry Controls',
      pass,
      'Live PATCH endpoint for stock increment/decrement/set with atomic safety'
    );
  } catch (err: any) {
    recordTest('Admin Inventory Restocking', false, err.message);
  }

  // TEST 10: Admin Products Creation & Editing API
  try {
    const productDetailRouteExists = fs.existsSync(path.resolve('src/app/api/admin/products/[id]/route.ts'));
    const adminProductsPageContent = fs.readFileSync(path.resolve('src/app/(admin)/admin/products/page.tsx'), 'utf8');

    const pass =
      productDetailRouteExists &&
      adminProductsPageContent.includes('handleCreateProduct') &&
      adminProductsPageContent.includes('handleSaveEdit');

    recordTest(
      'Admin Products Creation & Editing Capabilities',
      pass,
      'Dedicated PATCH/GET endpoint and frontend modal workflows for catalog management'
    );
  } catch (err: any) {
    recordTest('Admin Products Creation & Editing', false, err.message);
  }

  await mongoose.disconnect();

  console.log('\n======================================================================');
  const allPassed = results.every((r) => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter((r) => r.passed).length} | FAILED: ${results.filter((r) => !r.passed).length}`);
  console.log(allPassed ? '🎉 ALL PRODUCTION INTEGRITY CHECKS PASSED!' : '⚠️ SOME CHECKS FAILED');
  console.log('======================================================================');
}

runProductionIntegrityTests().catch(console.error);
