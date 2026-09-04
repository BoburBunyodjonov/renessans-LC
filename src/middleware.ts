import createMiddleware from 'next-intl/middleware';
import NextAuth from 'next-auth';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { authConfig } from '@/lib/auth.config';

const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Redirects to `path` on the host the request actually arrived on.
 *
 * `request.nextUrl.origin` resolves from AUTH_URL/NEXTAUTH_URL, which sends
 * staff to the configured host rather than the one they are browsing — wrong
 * behind a proxy, on a preview domain, or when the site answers on more than
 * one hostname. The forwarded headers are trusted here for the same reason
 * `trustHost` is set on the auth config.
 */
function redirectTo(request: NextRequest, path: string): NextResponse {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const protocol =
    request.headers.get('x-forwarded-proto') ?? request.nextUrl.protocol.replace(':', '');
  const origin = host ? `${protocol}://${host}` : request.nextUrl.origin;

  return NextResponse.redirect(new URL(path, origin));
}

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

    // Relative redirects on purpose. Building an absolute URL here resolves the
    // origin from AUTH_URL/NEXTAUTH_URL, which sends staff to the configured
    // host rather than the one they are actually browsing — wrong behind a
    // proxy, on a preview domain, or when the site answers on more than one
    // hostname. A relative Location keeps them where they are.
    if (!signedIn && !isLoginPage) {
      return redirectTo(request, `/admin/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }

    if (signedIn && isLoginPage) {
      return redirectTo(request, '/admin');
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
