import { SignJWT, jwtVerify } from 'jose';

const QR_TOKEN_SECRET = process.env.QR_TOKEN_SECRET || 'fallback-secret-for-development';
const TOKEN_EXPIRY_MINUTES = 3;

// Convert secret string to Uint8Array for jose
const getSecretKey = () => new TextEncoder().encode(QR_TOKEN_SECRET);

export interface QRTokenPayload {
  customerId: string;
  customerName: string;
  iat?: number;
  exp?: number;
}

/**
 * Generate a time-limited QR token
 * Valid for 3 minutes to prevent screenshot fraud
 */
export async function generateQRToken(customerId: string, customerName: string): Promise<string> {
  const secret = getSecretKey();
  
  const token = await new SignJWT({ 
    customerId, 
    customerName 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY_MINUTES}m`)
    .sign(secret);

  return token;
}

/**
 * Verify and decode a QR token
 * Returns null if invalid or expired
 */
export async function verifyQRToken(token: string): Promise<QRTokenPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    
    return payload as QRTokenPayload;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Get remaining time in seconds for a token
 * Returns 0 if expired or invalid
 */
export async function getTokenRemainingTime(token: string): Promise<number> {
  const payload = await verifyQRToken(token);
  
  if (!payload || !payload.exp) {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  
  return Math.max(0, remaining);
}

