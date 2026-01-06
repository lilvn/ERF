/**
 * PKCE (Proof Key for Code Exchange) helpers for OAuth 2.0
 * Used for secure authentication without client secrets
 */

// Generate random string for code verifier
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  return Array.from(randomValues)
    .map(v => charset[v % charset.length])
    .join('');
}

// Generate SHA-256 hash and encode as base64url
async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return await crypto.subtle.digest('SHA-256', data);
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE() {
  const codeVerifier = generateRandomString(128);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlEncode(hashed);
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  return generateRandomString(32);
}

/**
 * Generate random nonce for ID token validation
 */
export function generateNonce(): string {
  return generateRandomString(32);
}

