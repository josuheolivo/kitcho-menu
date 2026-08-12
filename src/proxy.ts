// =============================================
// Proxy — Kitcho Menu (Next.js 16+)
// =============================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedPaths = ['/dashboard'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if path is protected
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected) {
    // Check for auth cookie (Supabase stores it as sb-*)
    const hasAuthCookie = request.cookies.getAll().some(
      cookie => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
    );

    if (!hasAuthCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register|menu/).*)'],
};
