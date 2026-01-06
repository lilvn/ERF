import { generatePKCE, generateState, generateNonce } from './pkce';

const CLIENT_ID = process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_CLIENT_ID!;
const STORE_ID = process.env.NEXT_PUBLIC_SHOPIFY_STORE_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

// OAuth endpoints
const AUTH_URL = `https://shopify.com/authentication/${STORE_ID}/oauth/authorize`;
const TOKEN_URL = `https://shopify.com/authentication/${STORE_ID}/oauth/token`;
const LOGOUT_URL = `https://shopify.com/authentication/${STORE_ID}/logout`;

// Customer Account API endpoint
const API_URL = `https://shopify.com/${STORE_ID}/account/customer/api/2024-01/graphql`;

const REDIRECT_URI = `${APP_URL}/api/auth/callback`;

/**
 * Initiate OAuth login flow
 * Redirects user to Shopify login page
 */
export async function initiateLogin() {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = generateState();
  const nonce = generateNonce();

  // Store PKCE values in sessionStorage for callback
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('pkce_code_verifier', codeVerifier);
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('oauth_nonce', nonce);
  }

  // Build authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'openid email customer-account-api:full',
    redirect_uri: REDIRECT_URI,
    state: state,
    nonce: nonce,
    response_type: 'code',
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const authUrl = `${AUTH_URL}?${params.toString()}`;
  
  // Redirect to Shopify login
  window.location.href = authUrl;
}

/**
 * Exchange authorization code for access token
 * Called by the OAuth callback route
 */
export async function exchangeCodeForToken(code: string, codeVerifier: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    code: code,
    code_verifier: codeVerifier,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    idToken: data.id_token,
  };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
  });

  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * Fetch customer data from Customer Account API
 */
export async function getCustomerData(accessToken: string) {
  const query = `
    query getCustomer {
      customer {
        id
        emailAddress {
          emailAddress
        }
        firstName
        lastName
        orders(first: 10) {
          edges {
            node {
              id
              number
              totalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch customer data');
  }

  const { data, errors } = await response.json();
  
  if (errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(errors)}`);
  }

  return data.customer;
}

/**
 * Logout customer and revoke tokens
 */
export async function logoutCustomer(idToken: string) {
  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: APP_URL,
  });

  window.location.href = `${LOGOUT_URL}?${params.toString()}`;
}

/**
 * Extract customer ID from GID
 */
export function extractCustomerId(gid: string): string {
  // Customer GID format: gid://shopify/Customer/123456
  return gid.split('/').pop() || '';
}

