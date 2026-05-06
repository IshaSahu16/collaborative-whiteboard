import { NextResponse } from 'next/server';

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt');

  // Protected routes — redirect to login if no token
  const protectedRoutes = ['/boards', '/profile', '/board'];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Auth routes — redirect to boards if already logged in
  const authRoutes = ['/login', '/register', '/forgot-password'];
  const isAuthRoute = authRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/boards', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/boards/:path*',
    '/profile/:path*',
    '/board/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password/:path*',
  ],
};