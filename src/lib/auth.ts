import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET as string;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return null;
    }
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Signs a new JWT token for the authenticated user.
 */
export async function signToken(): Promise<string> {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return new SignJWT({ sub: 'user_1' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secretKey);
}
