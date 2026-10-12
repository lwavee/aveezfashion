import { NextRequest, NextResponse } from 'next/server';

// Known hub mappings for instant offline resolution
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  // Rajasthan
  '313001': { city: 'Udaipur', state: 'Rajasthan' },
  '313002': { city: 'Udaipur', state: 'Rajasthan' },
  '313003': { city: 'Udaipur', state: 'Rajasthan' },
  '302001': { city: 'Jaipur', state: 'Rajasthan' },
  '342001': { city: 'Jodhpur', state: 'Rajasthan' },
  // Maharashtra
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '411001': { city: 'Pune', state: 'Maharashtra' },
  // Delhi NCR
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi' },
  '122001': { city: 'Gurugram', state: 'Haryana' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  // Karnataka
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '560038': { city: 'Bengaluru', state: 'Karnataka' },
  // Gujarat
  '380001': { city: 'Ahmedabad', state: 'Gujarat' },
  '395001': { city: 'Surat', state: 'Gujarat' },
  // Tamil Nadu
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  // Telangana
  '500001': { city: 'Hyderabad', state: 'Telangana' },
  // West Bengal
  '700001': { city: 'Kolkata', state: 'West Bengal' },
};

export async function GET(
  req: NextRequest,
  { params }: { params: { pincode: string } }
) {
  const pincode = params.pincode?.trim();

  if (!pincode || !/^\d{6}$/.test(pincode)) {
    return NextResponse.json(
      { success: false, error: 'Invalid PIN code. Must be 6 digits.' },
      { status: 400 }
    );
  }

  // 1. Check local instant cache
  if (PINCODE_MAP[pincode]) {
    return NextResponse.json({
      success: true,
      data: {
        pincode,
        city: PINCODE_MAP[pincode].city,
        state: PINCODE_MAP[pincode].state,
      },
    });
  }

  // 2. Fetch from Postal Pincode API with timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        return NextResponse.json({
          success: true,
          data: {
            pincode,
            city: po.District || po.Division || po.Block || '',
            state: po.State || '',
          },
        });
      }
    }
  } catch {
    // If remote lookup times out or fails, return empty to allow manual entry
  }

  return NextResponse.json({
    success: false,
    message: 'PIN code not automatically resolved. Please enter City and State manually.',
  });
}
