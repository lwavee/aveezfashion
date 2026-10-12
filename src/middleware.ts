import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'aveez_fashion_jwt_ultra_secure_secret_key_2026_production_grade_token';
const SESSION_COOKIE_NAME = 'aveez_session';

/**
 * Validates JWT HS256 signature and expiration in Edge Runtime using standard Web Crypto API.
 */
async function verifyTokenInEdge(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(JWT_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature
    const sigStr = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = sigStr.length % 4 === 0 ? '' : '='.repeat(4 - (sigStr.length % 4));
    const rawSig = Uint8Array.from(atob(sigStr + pad), (c) => c.charCodeAt(0));

    // Verify HMAC signature
    const data = enc.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify('HMAC', key, rawSig, data);
    if (!isValid) return null;

    // Decode payload
    const payloadPad = payloadB64.length % 4 === 0 ? '' : '='.repeat(4 - (payloadB64.length % 4));
    const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/') + payloadPad);
    const payload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const payload = token ? await verifyTokenInEdge(token) : null;

  // 1. Admin login page: /admin/login
  if (pathname === '/admin/login') {
    if (payload && (payload.role === 'ADMIN' || payload.role === 'STAFF')) {
      // Already authenticated as admin, redirect to admin dashboard
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // 2. Admin dashboard and administrative routes: /admin/* (excluding /admin/login)
  if (pathname.startsWith('/admin')) {
    if (!payload) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
      // Normal user (CUSTOMER) attempted to access admin route
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 3. Admin API routes: /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // 4. Customer Account page: /account/*
  if (pathname.startsWith('/account')) {
    if (!payload) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 5. Auth pages (/login, /register): if already logged in, redirect to appropriate destination
  if (pathname === '/login' || pathname === '/register') {
    if (payload) {
      const dest = payload.role === 'ADMIN' ? '/admin' : '/account';
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/account/:path*',
    '/login',
    '/register',
  ],
};
