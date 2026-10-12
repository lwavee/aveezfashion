import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import {
  normalizeEmail,
  normalizePhone,
  isValidEmail,
  isValidPhone,
  hashPassword,
  signSessionToken,
  setSessionCookie,
} from '@/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      firstName: rawFirstName,
      lastName: rawLastName,
      email: rawEmail,
      phone: rawPhone,
      mobileNumber,
      password,
      confirmPassword,
    } = body;

    // Support both single "fullName" and separate "firstName"/"lastName"
    let firstName = (rawFirstName || '').trim();
    let lastName = (rawLastName || '').trim();

    if (fullName && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(' ') || parts[0];
    }

    const email = rawEmail ? normalizeEmail(rawEmail) : '';
    const rawPhoneVal = rawPhone || mobileNumber || '';
    const phone = rawPhoneVal ? normalizePhone(rawPhoneVal) : '';

    // Validate required fields
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Full name, email address, and password are required.' },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required.' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Validate phone number format (10-digit Indian standard)
    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // Validate password confirmation if provided
    if (confirmPassword !== undefined && password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check for duplicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // Check for duplicate phone number
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return NextResponse.json(
        { success: false, error: 'An account with this mobile number already exists.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (salt rounds = 12)
    const passwordHash = await hashPassword(password);

    // Always assign CUSTOMER role for public signup - ignore any privileged role from request
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      passwordHash,
      role: 'CUSTOMER',
      tokenVersion: 0,
      failedLoginAttempts: 0,
    });

    // Create session token
    const token = signSessionToken({
      userId: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      tokenVersion: newUser.tokenVersion,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully without OTP.',
        data: {
          user: {
            id: newUser._id,
            name: `${newUser.firstName} ${newUser.lastName}`.trim(),
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
          },
          token,
        },
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    setSessionCookie(response, token);

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
