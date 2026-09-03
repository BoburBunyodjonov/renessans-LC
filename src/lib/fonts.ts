import { Inter, Poppins } from 'next/font/google';

/**
 * Body face. Preloaded because it paints the bulk of every page; `cyrillic` is
 * required for the Russian locale.
 */
export const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Display face for headings. Deliberately *not* preloaded: preloading both
 * families pushed nine font files onto the critical path, which delayed the
 * largest paint on a throttled connection. Headings paint in the metric-adjusted
 * fallback and swap when Poppins arrives, so nothing shifts.
 */
export const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['700', '800'],
  display: 'swap',
  preload: false,
  adjustFontFallback: true,
  variable: '--font-poppins',
});
