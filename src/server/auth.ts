import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export const JWT_SECRET = process.env.JWT_SECRET || 'aveez_fashion_jwt_ultra_secure_secret_key_2026_production_grade_token';
export const SESSION_COOKIE_NAME = 'aveez_session';
export const BCRYPT_SALT_ROUNDS = 12;

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  phone?: string;
  tokenVersion?: number;
}

/**
 * Normalizes email by trimming and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes phone numbers to standard 10-digit format for India,
 * removing spaces, hyphens, parentheses, and leading +91 / 91 / 0.
 */
export function normalizePhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length > 10) {
    return digitsOnly.slice(-10);
  }
  return digitsOnly;
}

/**
 * Validates 10-digit Indian mobile number format.
 */
export function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^[6-9]\d{9}$/.test(normalized);
}

/**
 * Validates standard email address format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Hashes a plaintext password using bcrypt with salt rounds >= 12.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

/**
 * Verifies a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs a JWT session token with 7-day expiration.
 */
export function signSessionToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

/**
 * Verifies and decodes a JWT session token.
 */
export function verifySessionToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Session cookie options: HttpOnly, SameSite=lax, Secure in production.
 */
export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/',
  };
}

/**
 * Sets session cookie on a NextResponse.
 */
export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

/**
 * Clears session cookie on a NextResponse.
 */
export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Simple in-memory rate limiter to protect against repeated failed login attempts.
 */
interface RateLimitRecord {
  attempts: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, maxAttempts = 10, windowMs = 60 * 1000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { attempts: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.attempts >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.attempts += 1;
  return { allowed: true, remaining: maxAttempts - record.attempts };
}

/**
 * Helper to authenticate request from cookie and optionally verify required role.
 */
export function getSessionFromRequest(req: NextRequest): TokenPayload | null {
  let token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE_NAME}=([^;]+)`));
    if (match) {
      token = match[1];
    }
  }
  if (!token) {
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    }
  }
  if (!token) return null;
  return verifySessionToken(token);
}
