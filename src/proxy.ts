import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isInternalAuthPage = pathname === '/internal/login' || pathname === '/internal/register';
  const isAdminPage = pathname.startsWith('/admin');
  const isMerchantPage =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/payment-links') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/developers') ||
    pathname.startsWith('/business');
  const isPrivateAppPage =
    isMerchantPage || isAdminPage;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      const actorType = typeof payload.actorType === 'string' ? payload.actorType : null;

      if (isAuthPage) {
        const destination = actorType === 'internal' ? '/admin/overview' : '/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      }

      if (isInternalAuthPage) {
        const destination = actorType === 'internal' ? '/admin/overview' : '/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      }

      if (isAdminPage && actorType !== 'internal') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (isMerchantPage && actorType !== 'merchant') {
        return NextResponse.redirect(new URL('/admin/overview', request.url));
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
    '/business/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/internal/login',
    '/internal/register',
  ],
};
