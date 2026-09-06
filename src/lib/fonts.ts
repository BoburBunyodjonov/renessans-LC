/**
 * Fonts are vendored into `public/fonts` and declared in `src/app/fonts.css`
 * rather than fetched by `next/font/google` during the build.
 *
 * `next/font` downloads the families while `next build` runs, which turned a
 * slow network into a failed deploy twice — the image built everything else and
 * then died on `Failed to fetch \`Inter\` from Google Fonts`. Serving our own
 * copies makes the build offline-capable and removes Google from the runtime
 * request path as well.
 *
 * The generated CSS keeps the same per-subset `unicode-range` splits, so a page
 * still downloads only the subsets its text needs, and the metric-adjusted
 * fallback faces still prevent the swap from shifting layout.
 *
 * Regenerate with `node scripts/vendor-fonts.mjs` (see that file for how).
 */

/**
 * The subsets `next/font` used to preload, kept as preload links so the
 * critical path is unchanged: Latin, Latin Extended and Cyrillic for Inter.
 */
export const FONT_PRELOADS = [
  '/fonts/e4af272ccee01ff0-s.p.woff2',
  '/fonts/8e9860b6e62d6359-s.p.woff2',
  '/fonts/21350d82a1f187e9-s.p.woff2',
] as const;
