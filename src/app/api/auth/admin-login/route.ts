import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import {
  normalizeEmail,
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  checkRateLimit,
} from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Administrator email and password are required.' },
        { status: 400 }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for') || 'local';
    const rateLimitKey = `admin_login:${clientIp}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey, 5, 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many admin login attempts. Please wait a minute before trying again.',
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = normalizeEmail(email);
    const user = await User.findOne({ email: normalizedEmail });

    const genericError = 'Invalid administrator credentials.';

    if (!user) {
      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Check account temporary lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Administrator account locked. Try again in ${minutesRemaining} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      return NextResponse.json(
        { success: false, error: genericError },
        { status: 401 }
      );
    }

    // Strictly enforce role check on backend: reject normal user accounts
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Administrator privileges required.',
        },
        { status: 403 }
      );
    }

    // Reset failed count
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    const token = signSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      phone: user.phone,
      tokenVersion: user.tokenVersion,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Administrator authenticated successfully.',
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          role: user.role,
        },
        token,
        redirectUrl: '/admin',
      },
    });

    setSessionCookie(response, token);
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Admin authentication failed.' },
      { status: 500 }
    );
  }
}
