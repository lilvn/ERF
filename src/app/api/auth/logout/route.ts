import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const idToken = cookieStore.get('customer_id_token')?.value;

    // Clear all auth cookies
    const response = NextResponse.json({ success: true });
    
    response.cookies.delete('customer_access_token');
    response.cookies.delete('customer_refresh_token');
    response.cookies.delete('customer_id_token');

    // Return with ID token so client can redirect to Shopify logout
    return NextResponse.json({ 
      success: true,
      idToken: idToken || null,
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

