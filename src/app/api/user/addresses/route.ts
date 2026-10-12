import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import { getSessionFromRequest } from '@/server/auth';

// GET all saved addresses for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).lean();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const addresses = user.addresses || [];
    return NextResponse.json({
      success: true,
      data: {
        addresses,
        defaultAddress: user.defaultShippingAddress || addresses.find((a: any) => a.isDefault) || addresses[0] || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch addresses.' },
      { status: 500 }
    );
  }
}

// POST: Add new address
export async function POST(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      recipientName,
      phone,
      house,
      streetAddress,
      landmark,
      city,
      state,
      pincode,
      addressType = 'HOME',
      isDefault = false,
    } = body;

    if (!recipientName || !phone || !streetAddress || !city || !state || !pincode) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required address fields.' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const userAddresses = user.addresses || [];
    const shouldBeDefault = isDefault || userAddresses.length === 0;

    if (shouldBeDefault) {
      userAddresses.forEach((a: any) => {
        a.isDefault = false;
      });
    }

    const newAddress = {
      _id: new mongoose.Types.ObjectId(),
      recipientName: recipientName.trim(),
      phone: phone.trim(),
      house: house ? house.trim() : '',
      streetAddress: streetAddress.trim(),
      landmark: landmark ? landmark.trim() : '',
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      addressType,
      isDefault: shouldBeDefault,
    };

    userAddresses.push(newAddress as any);
    user.addresses = userAddresses;

    if (shouldBeDefault) {
      user.defaultShippingAddress = newAddress as any;
    }

    await user.save();

    const createdAddress = user.addresses[user.addresses.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: 'Address saved successfully.',
        data: {
          address: createdAddress,
          addresses: user.addresses,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save address.' },
      { status: 500 }
    );
  }
}
