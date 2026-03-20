import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Routes that do NOT require authentication
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout', '/api/auth/verify'];

// Static file extensions that should always pass through
const STATIC_EXTENSIONS = /\.(ico|png|jpg|jpeg|svg|webp|woff|woff2|ttf|css|js|json|txt|xml|map)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static files and Next.js internals
  if (STATIC_EXTENSIONS.test(pathname) || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for the auth cookie (set by login API)
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // No token at all → redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token
  const payload = verifyToken(token);

  if (!payload) {
    // Invalid or expired token → redirect to login and clear cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('auth_token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Valid token → allow through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
