import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/customerAccountApi';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle error from Shopify
  if (error) {
    return NextResponse.redirect(
      new URL(`/account?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Validate required parameters
  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/account?error=missing_parameters', request.url)
    );
  }

  try {
    // Get PKCE code verifier from cookie (set by client before redirect)
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get('pkce_code_verifier')?.value;
    const storedState = cookieStore.get('oauth_state')?.value;

    if (!codeVerifier || !storedState) {
      return NextResponse.redirect(
        new URL('/account?error=missing_session', request.url)
      );
    }

    // Verify state matches (CSRF protection)
    if (state !== storedState) {
      return NextResponse.redirect(
        new URL('/account?error=invalid_state', request.url)
      );
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForToken(code, codeVerifier);

    // Store tokens in httpOnly cookies
    const response = NextResponse.redirect(new URL('/account', request.url));
    
    // Set secure cookies
    response.cookies.set('customer_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresIn,
      path: '/',
    });

    if (tokens.refreshToken) {
      response.cookies.set('customer_refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    if (tokens.idToken) {
      response.cookies.set('customer_id_token', tokens.idToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: tokens.expiresIn,
        path: '/',
      });
    }

    // Clear PKCE cookies
    response.cookies.delete('pkce_code_verifier');
    response.cookies.delete('oauth_state');
    response.cookies.delete('oauth_nonce');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL('/account?error=authentication_failed', request.url)
    );
  }
}

