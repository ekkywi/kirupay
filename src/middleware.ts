import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isPrivateAppPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/payment-links') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/developers') ||
    pathname.startsWith('/admin');
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (token) {
    try {
      await jwtVerify(token, secret);

      if (isAuthPage) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
      
    } catch {
      if (isPrivateAppPage) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('auth-token');
        return response;
      }
    }
  }

  if (!token && isPrivateAppPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/payments/:path*',
    '/payment-links/:path*',
    '/analytics/:path*',
    '/settings/:path*',
    '/developers/:path*',
    '/admin/:path*',
    '/login',
    '/register',
  ],
};
