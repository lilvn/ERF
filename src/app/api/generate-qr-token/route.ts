import { NextRequest, NextResponse } from 'next/server';
import { generateQRToken } from '@/lib/qrToken';

export async function POST(request: NextRequest) {
  try {
    const { customerId, customerName } = await request.json();

    if (!customerId || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate token server-side (has access to QR_TOKEN_SECRET)
    const token = await generateQRToken(customerId, customerName);

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

