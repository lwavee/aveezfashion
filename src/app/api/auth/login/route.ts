import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import {
  normalizeEmail,
  normalizePhone,
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  checkRateLimit,
} from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, email, phone, mobile, password } = body;

    const loginId = (identifier || email || phone || mobile || '').trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, error: 'Please provide your email or mobile number and password.' },
        { status: 400 }
      );
    }

    // Rate limiting: 10 attempts per minute per IP/identifier
    const clientIp = req.headers.get('x-forwarded-for') || 'local';
    const rateLimitKey = `login:${clientIp}:${loginId}`;
    const rateCheck = checkRateLimit(rateLimitKey, 10, 60 * 1000);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many failed login attempts. Please wait a minute before trying again.',
        },
        { status: 429 }
      );
    }

    await connectToDatabase();

    // Query user by email OR phone
    let user;
    if (loginId.includes('@')) {
      const normalizedEmail = normalizeEmail(loginId);
      user = await User.findOne({ email: normalizedEmail });
    } else {
      const normalizedPhone = normalizePhone(loginId);
      user = await User.findOne({
        $or: [
          { phone: normalizedPhone },
          { email: normalizeEmail(loginId) },
        ],
      });
    }

    // Generic error message for security (prevents account enumeration)
    const genericAuthError = 'Invalid email, mobile number, or password.';

    if (!user) {
      return NextResponse.json(
        { success: false, error: genericAuthError },
        { status: 401 }
      );
    }

    // Check account temporary lock from failed attempts
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return NextResponse.json(
        {
          success: false,
          error: `Account is temporarily locked due to repeated failed attempts. Please try again in ${minutesRemaining} minute(s).`,
        },
        { status: 423 }
      );
    }

    // Validate password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        // Lock for 15 minutes
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await user.save();

      return NextResponse.json(
        { success: false, error: genericAuthError },
        { status: 401 }
      );
    }

    // Reset failed login count and lock on successful login
    if (user.failedLoginAttempts > 0 || user.lockUntil) {
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();
    }

    // Sign JWT token
    const token = signSessionToken({
      userId: String(user._id),
      email: user.email,
      role: user.role,
      phone: user.phone,
      tokenVersion: user.tokenVersion,
    });

    // Determine redirect dashboard
    const redirectUrl = user.role === 'ADMIN' ? '/admin' : '/account';

    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully without OTP.',
      data: {
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        token,
        redirectUrl,
      },
    });

    // Set secure HTTP-only cookie
    setSessionCookie(response, token);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed.' },
      { status: 500 }
    );
  }
}
