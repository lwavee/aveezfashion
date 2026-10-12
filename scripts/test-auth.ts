import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../src/server/models/User';
import { normalizeEmail, normalizePhone, verifyPassword } from '../src/server/auth';

// Load .env.local
if (!process.env.MONGODB_URI) {
  const envLocalPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envLocalPath)) {
    const lines = fs.readFileSync(envLocalPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...rest] = trimmed.split('=');
        if (key && rest.length > 0) {
          process.env[key.trim()] = rest.join('=').trim();
        }
      }
    }
  }
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

async function runTestSuite() {
  console.log('=================================================================');
  console.log('AVEEZ FASHION — AUTHENTICATION & SECURITY VERIFICATION TEST SUITE');
  console.log(`Target Server: ${BASE_URL}`);
  console.log('=================================================================\n');

  await mongoose.connect(MONGODB_URI);

  // -------------------------------------------------------------
  // Test 1: Verify Seeded Normal User (Vishna Panchal)
  // -------------------------------------------------------------
  const normalUser = await User.findOne({ email: 'vishu@gmail.com' });
  const isNormalUserPresent = !!normalUser;
  const isNormalUserBcrypt = normalUser?.passwordHash?.startsWith('$2') || false;
  const isNormalUserPwValid = normalUser ? await bcrypt.compare('vishu123', normalUser.passwordHash) : false;
  recordTest(
    'Initial Normal User Account Seed Verification',
    isNormalUserPresent && isNormalUserBcrypt && isNormalUserPwValid && normalUser?.role === 'CUSTOMER',
    `Found: ${normalUser?.email}, Role: ${normalUser?.role}, Phone: ${normalUser?.phone}, Bcrypt Hashed: ${isNormalUserBcrypt}`
  );

  // -------------------------------------------------------------
  // Test 2: Verify Seeded Administrator Account (Sarla Admin)
  // -------------------------------------------------------------
  const adminUser = await User.findOne({ email: 'sarla@aveezfashion.com' });
  const isAdminUserPresent = !!adminUser;
  const isAdminUserBcrypt = adminUser?.passwordHash?.startsWith('$2') || false;
  const isAdminUserPwValid = adminUser ? await bcrypt.compare('Sarla@70144', adminUser.passwordHash) : false;
  recordTest(
    'Initial Administrator Account Seed Verification',
    isAdminUserPresent && isAdminUserBcrypt && isAdminUserPwValid && adminUser?.role === 'ADMIN',
    `Found: ${adminUser?.email}, Role: ${adminUser?.role}, Bcrypt Hashed: ${isAdminUserBcrypt}`
  );

  // -------------------------------------------------------------
  // Test 3: User Signup Without OTP via API
  // -------------------------------------------------------------
  const testSignupEmail = `testuser_${Date.now()}@example.com`;
  const testSignupPhone = `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  let signupCookie = '';
  try {
    const signupRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test Automation User',
        email: testSignupEmail,
        phone: testSignupPhone,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });

    const signupData = await signupRes.json();
    const cookieHeader = signupRes.headers.get('set-cookie') || '';
    signupCookie = cookieHeader.split(';')[0];

    const passed = signupRes.status === 201 && signupData.success === true && signupData.data.user.role === 'CUSTOMER';
    recordTest(
      'User Signup Without OTP (Password-Based Registration)',
      passed,
      `Status: ${signupRes.status}, Role Assigned: ${signupData.data?.user?.role}, Cookie Set: ${!!signupCookie}`
    );
  } catch (err: any) {
    recordTest('User Signup Without OTP', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 4: Duplicate Email Rejection
  // -------------------------------------------------------------
  try {
    const dupEmailRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: 'vishu@gmail.com', // Already exists
        phone: `91${Math.floor(10000000 + Math.random() * 90000000)}`,
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    const dupData = await dupEmailRes.json();
    const passed = dupEmailRes.status === 409 && dupData.success === false;
    recordTest(
      'Duplicate Email Rejection',
      passed,
      `Status: ${dupEmailRes.status}, Error: "${dupData.error}"`
    );
  } catch (err: any) {
    recordTest('Duplicate Email Rejection', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 5: Duplicate Phone Number Rejection
  // -------------------------------------------------------------
  try {
    const dupPhoneRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Duplicate Phone User',
        email: `newunique_${Date.now()}@example.com`,
        phone: '8955109628', // Vishu's phone
        password: 'Password@123',
        confirmPassword: 'Password@123',
      }),
    });
    const dupData = await dupPhoneRes.json();
    const passed = dupPhoneRes.status === 409 && dupData.success === false;
    recordTest(
      'Duplicate Mobile Number Rejection',
      passed,
      `Status: ${dupPhoneRes.status}, Error: "${dupData.error}"`
    );
  } catch (err: any) {
    recordTest('Duplicate Mobile Number Rejection', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 6: User Login with Email and Password
  // -------------------------------------------------------------
  let userSessionCookie = '';
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'vishu@gmail.com',
        password: 'vishu123',
      }),
    });
    const loginData = await loginRes.json();
    const cookieHeader = loginRes.headers.get('set-cookie') || '';
    userSessionCookie = cookieHeader.split(';')[0];

    const passed = loginRes.status === 200 && loginData.success === true && loginData.data.user.email === 'vishu@gmail.com';
    recordTest(
      'User Login with Email and Password',
      passed,
      `Status: ${loginRes.status}, Redirect: ${loginData.data?.redirectUrl}, Session Cookie Received: ${!!userSessionCookie}`
    );
  } catch (err: any) {
    recordTest('User Login with Email and Password', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 7: User Login with Phone Number and Password
  // -------------------------------------------------------------
  try {
    const phoneLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '8955109628',
        password: 'vishu123',
      }),
    });
    const loginData = await phoneLoginRes.json();
    const passed = phoneLoginRes.status === 200 && loginData.success === true && loginData.data.user.phone === '8955109628';
    recordTest(
      'User Login with Phone Number and Password',
      passed,
      `Status: ${phoneLoginRes.status}, Authenticated User: ${loginData.data?.user?.name}`
    );
  } catch (err: any) {
    recordTest('User Login with Phone Number and Password', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 8: Invalid Password Rejection (Generic Error)
  // -------------------------------------------------------------
  try {
    const invalidPwRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'vishu@gmail.com',
        password: 'WrongPassword999',
      }),
    });
    const data = await invalidPwRes.json();
    const passed = invalidPwRes.status === 401 && data.success === false && data.error === 'Invalid email, mobile number, or password.';
    recordTest(
      'Invalid Password Rejection (Generic Error)',
      passed,
      `Status: ${invalidPwRes.status}, Generic Error: "${data.error}"`
    );
  } catch (err: any) {
    recordTest('Invalid Password Rejection', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 9: Administrator Login Using Email and Password
  // -------------------------------------------------------------
  let adminSessionCookie = '';
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sarla@aveezfashion.com',
        password: 'Sarla@70144',
      }),
    });
    const adminData = await adminLoginRes.json();
    const cookieHeader = adminLoginRes.headers.get('set-cookie') || '';
    adminSessionCookie = cookieHeader.split(';')[0];

    const passed =
      adminLoginRes.status === 200 &&
      adminData.success === true &&
      adminData.data.user.role === 'ADMIN' &&
      adminData.data.redirectUrl === '/admin';
    recordTest(
      'Administrator Login with Email and Password',
      passed,
      `Status: ${adminLoginRes.status}, Role: ${adminData.data?.user?.role}, Redirect: ${adminData.data?.redirectUrl}`
    );
  } catch (err: any) {
    recordTest('Administrator Login', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 10: Normal User Denied Access to Admin Login Endpoint
  // -------------------------------------------------------------
  try {
    const customerOnAdminRes = await fetch(`${BASE_URL}/api/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vishu@gmail.com', // Normal customer
        password: 'vishu123',
      }),
    });
    const resData = await customerOnAdminRes.json();
    const passed = customerOnAdminRes.status === 403 && resData.success === false;
    recordTest(
      'Normal User Denied Access to Administrator Login (403 Forbidden)',
      passed,
      `Status: ${customerOnAdminRes.status}, Error: "${resData.error}"`
    );
  } catch (err: any) {
    recordTest('Normal User Denied Admin Login', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 11: Normal User Denied Access to Protected Admin API
  // -------------------------------------------------------------
  try {
    // Attempt request to /api/admin/catalog or /api/admin with customer session cookie
    const adminApiRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      method: 'GET',
      headers: {
        Cookie: userSessionCookie,
      },
    });
    // Middleware intercepts /api/admin/* and returns 403 for non-admin
    const passed = adminApiRes.status === 403;
    recordTest(
      'Normal User Denied Access to Admin Routes & APIs (RBAC Enforcement)',
      passed,
      `Status: ${adminApiRes.status} Forbidden for CUSTOMER role`
    );
  } catch (err: any) {
    recordTest('Normal User Denied Admin Route', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 12: Unauthenticated Requests Denied Access to Admin API
  // -------------------------------------------------------------
  try {
    const unauthRes = await fetch(`${BASE_URL}/api/admin/metrics`, {
      method: 'GET',
    });
    const passed = unauthRes.status === 401;
    recordTest(
      'Unauthenticated Request Denied Access to Admin API (401 Unauthorized)',
      passed,
      `Status: ${unauthRes.status} Unauthorized without session`
    );
  } catch (err: any) {
    recordTest('Unauthenticated Request Denied Admin API', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 13: Session Persistence Verification (/api/auth/me)
  // -------------------------------------------------------------
  try {
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        Cookie: userSessionCookie,
      },
    });
    const meData = await meRes.json();
    const passed = meRes.status === 200 && meData.success === true && meData.data?.user?.email === 'vishu@gmail.com';
    recordTest(
      'Session Persistence & Profile Verification (/api/auth/me)',
      passed,
      `Status: ${meRes.status}, Profile Verified: ${meData.data?.user?.name}`
    );
  } catch (err: any) {
    recordTest('Session Persistence Verification', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 14: Logout and Session Cookie Invalidation
  // -------------------------------------------------------------
  try {
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: userSessionCookie,
      },
    });
    const cookieHeader = logoutRes.headers.get('set-cookie') || '';
    const cookieCleared = cookieHeader.includes('Max-Age=0') || cookieHeader.includes('expires=Thu, 01 Jan 1970');
    const passed = logoutRes.status === 200 && cookieCleared;
    recordTest(
      'Logout & Session Invalidation (Cookie Expiration)',
      passed,
      `Status: ${logoutRes.status}, Set-Cookie cleared: ${cookieCleared}`
    );
  } catch (err: any) {
    recordTest('Logout & Session Invalidation', false, err.message);
  }

  // -------------------------------------------------------------
  // Test 15: Clean-up Test User & Close DB
  // -------------------------------------------------------------
  await User.deleteOne({ email: testSignupEmail });
  await mongoose.disconnect();

  console.log('\n=================================================================');
  const allPassed = results.every((r) => r.passed);
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passedCount} | FAILED: ${total - passedCount}`);
  if (allPassed) {
    console.log('🎉 ALL AUTHENTICATION AND SECURITY TESTS PASSED PERFECTLY!');
  } else {
    console.log('⚠️ SOME TESTS FAILED. CHECK OUTPUT ABOVE.');
  }
  console.log('=================================================================');

  if (!allPassed) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
