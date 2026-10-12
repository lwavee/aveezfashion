import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/server/db/connect';
import { User } from '@/server/models/User';
import { getSessionFromRequest } from '@/server/auth';

// PUT: Update address
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const addressId = params.id;
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
      addressType,
      isDefault,
    } = body;

    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const addrIndex = (user.addresses || []).findIndex(
      (a: any) => String(a._id) === addressId
    );

    if (addrIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Address not found.' },
        { status: 404 }
      );
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    if (isDefault) {
      user.addresses.forEach((a: any) => {
        a.isDefault = false;
      });
    }

    const currentAddr = user.addresses[addrIndex];
    if (recipientName) currentAddr.recipientName = recipientName.trim();
    if (phone) currentAddr.phone = phone.trim();
    if (house !== undefined) currentAddr.house = house.trim();
    if (streetAddress) currentAddr.streetAddress = streetAddress.trim();
    if (landmark !== undefined) currentAddr.landmark = landmark.trim();
    if (city) currentAddr.city = city.trim();
    if (state) currentAddr.state = state.trim();
    if (pincode) currentAddr.pincode = pincode.trim();
    if (addressType) currentAddr.addressType = addressType;
    if (isDefault !== undefined) currentAddr.isDefault = isDefault;

    if (currentAddr.isDefault) {
      user.defaultShippingAddress = currentAddr;
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address updated successfully.',
      data: {
        address: currentAddr,
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update address.' },
      { status: 500 }
    );
  }
}

// DELETE: Remove address
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const addressId = params.id;
    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    const initialLength = user.addresses?.length || 0;
    user.addresses = (user.addresses || []).filter(
      (a: any) => String(a._id) !== addressId
    );

    if (user.addresses.length === initialLength) {
      return NextResponse.json(
        { success: false, error: 'Address not found.' },
        { status: 404 }
      );
    }

    // If deleted address was default, set first remaining as default
    if (
      user.addresses.length > 0 &&
      !user.addresses.some((a: any) => a.isDefault)
    ) {
      user.addresses[0].isDefault = true;
      user.defaultShippingAddress = user.addresses[0];
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Address removed successfully.',
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete address.' },
      { status: 500 }
    );
  }
}

// PATCH: Set as default address
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const addressId = params.id;
    await connectToDatabase();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found.' },
        { status: 404 }
      );
    }

    let found = false;
    if (!user.addresses) {
      user.addresses = [];
    }
    user.addresses.forEach((a: any) => {
      if (String(a._id) === addressId) {
        a.isDefault = true;
        user.defaultShippingAddress = a;
        found = true;
      } else {
        a.isDefault = false;
      }
    });

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Address not found.' },
        { status: 404 }
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Default address updated.',
      data: {
        addresses: user.addresses,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to set default address.' },
      { status: 500 }
    );
  }
}
