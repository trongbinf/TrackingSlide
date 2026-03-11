import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Only protect specific paths
  const protectedPaths = ['/', '/api/stats', '/api/logs', '/api/units'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // 2. Exclude public API and Login page
  if (request.nextUrl.pathname.startsWith('/api/t') || request.nextUrl.pathname.startsWith('/api/auth') || request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  // 3. Check for auth cookie
  if (isProtectedPath) {
    const authCookie = request.cookies.get('auth_session');
    
    // Simple check: if cookie doesn't exist, redirect to login
    if (!authCookie || authCookie.value !== 'authenticated') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
