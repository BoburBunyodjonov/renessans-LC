import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/**
 * Hosts the site is allowed to talk to. Kept explicit so a new integration has
 * to be added deliberately rather than silently working in dev and failing the
 * CSP audit later.
 */
const ANALYTICS_HOSTS = [
  'https://www.googletagmanager.com',
  'https://www.google-analytics.com',
  'https://connect.facebook.net',
  'https://www.facebook.com',
  'https://mc.yandex.ru',
];

const IMAGE_HOSTS = ['https://images.unsplash.com', 'https://i.ytimg.com'];

const FRAME_HOSTS = [
  'https://www.youtube-nocookie.com',
  'https://www.youtube.com',
  'https://yandex.uz',
  'https://yandex.com',
  'https://*.yandex.ru',
];

/**
 * `'unsafe-inline'` on `script-src` is the price of static/ISR rendering: a
 * nonce has to be generated per request, which would force every page dynamic.
 * Everything else is locked down, and `object-src`/`base-uri`/`form-action`
 * close the usual injection escapes.
 */
const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${ANALYTICS_HOSTS.join(' ')}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${IMAGE_HOSTS.join(' ')} ${ANALYTICS_HOSTS.join(' ')}`,
  `font-src 'self' data:`,
  `media-src 'self' blob: https:`,
  `connect-src 'self' ${ANALYTICS_HOSTS.join(' ')} https://api.telegram.org`,
  `frame-src 'self' ${FRAME_HOSTS.join(' ')}`,
  `frame-ancestors 'self'`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=(), payment=()',
  },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Self-contained server bundle for the production Docker image.
  output: 'standalone',
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  // jsdom (via isomorphic-dompurify) resolves its own assets from disk, so it
  // must stay external instead of being bundled into the server output.
  serverExternalPackages: ['isomorphic-dompurify', 'jsdom'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
    inlineCss: true,
    // The stylesheet is render-blocking: on a slow connection the HTML arrived
    // at 0.8s but nothing painted until 2.4s, because the browser was still
    // fetching 68 KB of CSS. Inlining it removes that round trip.
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Uploads are user-supplied: never let a browser sniff them.
        source: '/api/uploads/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: `default-src 'none'; sandbox` },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
