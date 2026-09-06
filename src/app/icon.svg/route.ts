import { getBrandScale } from '@/server/queries/site';

/**
 * The default site icon, painted in whatever brand colour the admin chose.
 *
 * It used to be a static file with the red baked in, which left a red tab icon
 * on a site recoloured to anything else. A school that uploads its own favicon
 * in settings never reaches this — it is the fallback.
 */
export const revalidate = 3600;

export async function GET() {
  const brand = await getBrandScale();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="16" fill="${brand[600]}"/>
  <text x="32" y="45" font-family="system-ui, sans-serif" font-size="38" font-weight="900" fill="#fff" text-anchor="middle">R</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
