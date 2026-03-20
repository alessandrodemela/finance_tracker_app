import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

export interface JwtPayload {
  sub: string;
  iat?: number;
  exp?: number;
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Signs a new JWT token for the authenticated user.
 */
export function signToken(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  return jwt.sign({ sub: 'user_1' }, JWT_SECRET, { expiresIn: '7d' });
}
