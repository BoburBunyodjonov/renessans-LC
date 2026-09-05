import type { MetadataRoute } from 'next';
import { getBrandScale, getSiteSettings } from '@/server/queries/site';
import { DEFAULT_LOCALE } from '@/types/i18n';

export const revalidate = 3600;

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [settings, brand] = await Promise.all([getSiteSettings(DEFAULT_LOCALE), getBrandScale()]);

  return {
    name: settings.brandName,
    short_name: settings.brandName.split(' ')[0] ?? settings.brandName,
    description: settings.tagline,
    start_url: `/${DEFAULT_LOCALE}`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: brand[600],
    lang: DEFAULT_LOCALE,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  };
}
