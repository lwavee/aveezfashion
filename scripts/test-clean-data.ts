import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { User } from '../src/server/models/User';
import { Product } from '../src/server/models/Product';
import { Category } from '../src/server/models/Category';
import { Collection } from '../src/server/models/Collection';
import { Order } from '../src/server/models/Order';

// Load .env.local
const envLocalPath = path.resolve('.env.local');
if (fs.existsSync(envLocalPath)) {
  fs.readFileSync(envLocalPath, 'utf8').split('\n').forEach((l) => {
    const [k, ...v] = l.trim().split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/aveez_fashion';

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

async function runCleanDataTests() {
  console.log('=================================================================');
  console.log('AVEEZ FASHION — DUMMY DATA REMOVAL & TELEMETRY VERIFICATION TEST');
  console.log(`Server: ${BASE_URL}`);
  console.log('=================================================================\n');

  await mongoose.connect(MONGODB_URI);

  // -------------------------------------------------------------
  // Test 1: Codebase Scan — No hardcoded demo orders
  // -------------------------------------------------------------
  const adminPageContent = fs.readFileSync(path.resolve('src/app/(admin)/admin/page.tsx'), 'utf8');
  const accountPageContent = fs.readFileSync(path.resolve('src/app/(customer)/account/page.tsx'), 'utf8');

  const demoOrderIds = ['AVZ-2026-004812', 'AVZ-2026-004811', 'AVZ-2026-004810', 'AVZ-2026-004809'];
  const hasDemoOrdersInAdmin = demoOrderIds.some((id) => adminPageContent.includes(id));
  const hasDemoOrdersInAccount = demoOrderIds.some((id) => accountPageContent.includes(id));
  const hasFakeRevenue = adminPageContent.includes('2,48,500');
  const hasFakeCustomers = adminPageContent.includes('182');

  recordTest(
    'No Hardcoded Demo Orders or Fake Figures in Admin Dashboard',
    !hasDemoOrdersInAdmin && !hasFakeRevenue && !hasFakeCustomers,
    `Demo orders found in admin: ${hasDemoOrdersInAdmin}, Fake revenue: ${hasFakeRevenue}`
  );

  recordTest(
    'No Hardcoded Demo Orders in Customer Account Page',
    !hasDemoOrdersInAccount,
    `Demo orders found in account: ${hasDemoOrdersInAccount}`
  );

  // -------------------------------------------------------------
  // Test 2: Database Catalog Preservation (6 master products, 23 variants)
  // -------------------------------------------------------------
  const products = await Product.find({}).lean();
  let totalVariants = 0;
  for (const p of products) {
    totalVariants += p.variants?.length || 0;
  }
  const categoriesCount = await Category.countDocuments({});
  const collectionsCount = await Collection.countDocuments({});

  recordTest(
    'Real Catalog Data & Product Variants Preservation',
    products.length === 6 && totalVariants === 23 && categoriesCount === 6 && collectionsCount === 2,
    `Products: ${products.length}, Variants: ${totalVariants}, Categories: ${categoriesCount}, Collections: ${collectionsCount}`
  );

  // -------------------------------------------------------------
  // Test 3: Legitimate User & Administrator Accounts Preservation
  // -------------------------------------------------------------
  const normalUser = await User.findOne({ email: 'vishu@gmail.com' });
  const adminUser = await User.findOne({ email: 'sarla@aveezfashion.com' });

  recordTest(
    'Legitimate Customer & Administrator Accounts Preserved',
    !!normalUser && !!adminUser && adminUser.role === 'ADMIN' && normalUser.role === 'CUSTOMER',
    `Normal User: ${normalUser?.email} (${normalUser?.role}), Admin User: ${adminUser?.email} (${adminUser?.role})`
  );

  // -------------------------------------------------------------
  // Test 4: Real Order Preservation in Database
  // -------------------------------------------------------------
  const realOrder = await Order.findOne({ orderNumber: 'AVZ-2026-659072' });
  recordTest(
    'Legitimate Customer Order Preserved in Database',
    !!realOrder,
    `Order: ${realOrder?.orderNumber}, Customer: ${realOrder?.customerName}, Total: ₹${realOrder?.pricing?.grandTotal}`
  );

  // -------------------------------------------------------------
  // Test 5: Admin Login to Obtain Session Cookie
  // -------------------------------------------------------------
  let adminCookie = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarla@aveezfashion.com',
        password: 'Sarla@70144',
      }),
    });
    const loginData = await loginRes.json();
    adminCookie = (loginRes.headers.get('set-cookie') || '').split(';')[0];
    recordTest(
      'Administrator Session Authentication',
      loginRes.status === 200 && loginData.success === true,
      `Status: ${loginRes.status}, Cookie: ${!!adminCookie}`
    );
  } catch (err: any) {
    recordTest('Administrator Session Authentication', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 6: Verify Admin Metrics API Returns Real Telemetry
  // -------------------------------------------------------------
  try {
    const metricsRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      headers: { Cookie: adminCookie },
    });
    const metricsData = await metricsRes.json();

    const m = metricsData.data?.metrics;
    const orders = metricsData.data?.recentOrders;

    const isRevenueReal = m?.totalRevenue?.rawValue === 0 || m?.totalRevenue?.rawValue === 1798;
    const isOrdersCountReal = m?.confirmedOrders?.rawValue === 1;
    const isCustomersCountReal = m?.registeredCustomers?.rawValue >= 1;
    const isVariantsReal = m?.activeCatalogSkus?.rawValue === 23;

    // Check that recent orders in telemetry contains the REAL order, not demo orders
    const containsRealOrder = orders?.some((o: any) => o.orderNumber === 'AVZ-2026-659072');
    const containsFakeOrder = orders?.some((o: any) => o.orderNumber === 'AVZ-2026-004812');

    recordTest(
      'Live Database Metrics Telemetry Calculation',
      metricsRes.status === 200 && isOrdersCountReal && isVariantsReal && !containsFakeOrder,
      `Revenue: ${m?.totalRevenue?.value}, Orders: ${m?.confirmedOrders?.value}, Customers: ${m?.registeredCustomers?.value}, SKUs: ${m?.activeCatalogSkus?.value}`
    );

    recordTest(
      'Fulfillment Queue Displays Actual Database Orders Only',
      containsRealOrder && !containsFakeOrder,
      `Real order present: ${containsRealOrder}, Fake orders present: ${containsFakeOrder}`
    );
  } catch (err: any) {
    recordTest('Live Database Metrics Telemetry Calculation', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 7: Verify Admin Products API Returns All Real Catalog Products
  // -------------------------------------------------------------
  try {
    const prodRes = await fetch(`${BASE_URL}/api/admin/products`, {
      headers: { Cookie: adminCookie },
    });
    const prodData = await prodRes.json();
    const passed = prodRes.status === 200 && prodData.data?.products?.length === 6;
    recordTest(
      'Admin Products API Returns Complete Real Catalog (6 Master Products)',
      passed,
      `Status: ${prodRes.status}, Total master products: ${prodData.data?.products?.length}`
    );
  } catch (err: any) {
    recordTest('Admin Products API', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 8: Verify Admin Customers API Returns Real Customers Only
  // -------------------------------------------------------------
  try {
    const custRes = await fetch(`${BASE_URL}/api/admin/customers`, {
      headers: { Cookie: adminCookie },
    });
    const custData = await custRes.json();
    const hasVishu = custData.data?.customers?.some((c: any) => c.email === 'vishu@gmail.com');
    const hasFakeCustomer = custData.data?.customers?.some((c: any) => c.name === 'Arjun Mehta');
    recordTest(
      'Admin Customers API Returns Real Registered Customers Only',
      custRes.status === 200 && hasVishu && !hasFakeCustomer,
      `Real user Vishu: ${hasVishu}, Fake user Arjun: ${hasFakeCustomer}`
    );
  } catch (err: any) {
    recordTest('Admin Customers API', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 9: Verify Customer Orders API with Normal User
  // -------------------------------------------------------------
  try {
    const userLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'vishu@gmail.com',
        password: 'vishu123',
      }),
    });
    const userCookie = (userLoginRes.headers.get('set-cookie') || '').split(';')[0];

    const customerOrdersRes = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Cookie: userCookie },
    });
    const ordersData = await customerOrdersRes.json();
    const noFakeOrders = !ordersData.data?.orders?.some((o: any) => o.orderNumber === 'AVZ-2026-004812');
    recordTest(
      'Customer Orders API Returns Only User Orders (No Demo Order Fallback)',
      customerOrdersRes.status === 200 && noFakeOrders,
      `Orders returned: ${ordersData.data?.orders?.length}, No fake order: ${noFakeOrders}`
    );
  } catch (err: any) {
    recordTest('Customer Orders API', false, err.message);
  }

  await mongoose.disconnect();

  console.log('\n=================================================================');
  const allPassed = results.every((r) => r.passed);
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passedCount} | FAILED: ${total - passedCount}`);
  if (allPassed) {
    console.log('🎉 ALL DUMMY DATA REMOVAL & PRESERVATION CHECKS PASSED PERFECTLY!');
  } else {
    console.log('⚠️ SOME CHECKS FAILED.');
  }
  console.log('=================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runCleanDataTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
