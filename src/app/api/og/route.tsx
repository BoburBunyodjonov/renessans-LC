import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { getBrandScale } from '@/server/queries/site';

export const runtime = 'nodejs';

/**
 * Satori (behind ImageResponse) needs real font data for weights — with no font
 * supplied everything renders in a single light face. The file is fetched once
 * per server process and the image still renders if the fetch fails.
 */
let boldFont: ArrayBuffer | null | undefined;

async function loadBoldFont(): Promise<ArrayBuffer | null> {
  if (boldFont !== undefined) return boldFont;

  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Inter:wght@800&display=swap',
      // This UA makes Google serve a TTF, which is what Satori can parse.
      { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 6.1)' }, cache: 'force-cache' },
    ).then((response) => response.text());

    const url = css.match(/src:\s*url\((https:[^)]+)\)/)?.[1];
    boldFont = url ? await fetch(url, { cache: 'force-cache' }).then((r) => r.arrayBuffer()) : null;
  } catch {
    boldFont = null;
  }

  return boldFont ?? null;
}

/**
 * Dynamic Open Graph image: `/api/og?title=…&subtitle=…&badge=…`.
 * Uses the brand block treatment so shared links look like the site.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const title = (params.get('title') ?? 'Renessans English School').slice(0, 120);
  const subtitle = (params.get('subtitle') ?? '').slice(0, 160);
  const badge = (params.get('badge') ?? '').slice(0, 40);
  const [font, brand] = await Promise.all([loadBoldFont(), getBrandScale()]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: brand[600],
        padding: '72px',
        color: '#ffffff',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: '#ffffff',
            color: brand[600],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
            fontWeight: 900,
          }}
        >
          R
        </div>
        {badge ? (
          <div
            style={{
              borderRadius: 999,
              background: 'rgba(0,0,0,0.25)',
              padding: '10px 22px',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {badge}
          </div>
        ) : null}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ fontSize: title.length > 60 ? 60 : 76, fontWeight: 800, lineHeight: 1.1 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ fontSize: 30, lineHeight: 1.35, opacity: 0.92 }}>{subtitle}</div>
        ) : null}
      </div>

      <div style={{ display: 'flex', fontSize: 26, opacity: 0.9 }}>
        Renessans English School · Toshkent
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      ...(font
        ? { fonts: [{ name: 'Inter', data: font, weight: 800 as const, style: 'normal' as const }] }
        : {}),
    },
  );
}
