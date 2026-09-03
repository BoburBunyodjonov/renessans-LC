import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth.config';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Two areas, two rules:
 *   * `/admin/**` — session gate (no locale prefix);
 *   * everything else — next-intl locale routing.
 */
export default auth((request: NextRequest & { auth: unknown }) => {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const isLoginPage = pathname === '/admin/login';
    const signedIn = Boolean(request.auth);

    if (!signedIn && !isLoginPage) {
      const url = new URL('/admin/login', request.nextUrl);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (signedIn && isLoginPage) {
      return NextResponse.redirect(new URL('/admin', request.nextUrl));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
});

export const config = {
  matcher: [
    // Public site: everything except API routes, Next internals and files.
    '/((?!api|_next|_vercel|.*\\..*).*)',
    // Admin panel.
    '/admin/:path*',
  ],
};
