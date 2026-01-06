import { NextRequest, NextResponse } from 'next/server';
import { verifyQRToken } from '@/lib/qrToken';
import { getCustomerData } from '@/lib/shopify';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify the QR token
    const payload = await verifyQRToken(token);

    if (!payload) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Invalid or expired QR code' 
        },
        { status: 200 }
      );
    }

    // Token is valid, return the customer info from the token
    // Note: We're trusting the token since it's cryptographically signed
    // For extra security, you could fetch fresh data from Shopify here
    
    return NextResponse.json({
      valid: true,
      customerName: payload.customerName,
      customerId: payload.customerId,
      membershipType: payload.membershipType,
      membershipExpiryDate: payload.membershipExpiryDate,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

