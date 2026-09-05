import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { SettingsForm } from '@/components/admin/settings-form';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { asLocalized, asLocalizedList, type Localized } from '@/types/i18n';
import { DEFAULT_BRAND } from '@/lib/theme';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const t = await getTranslations('admin');
  return { title: t('nav.settings') };
}

const EMPTY: Localized = { uz: '', ru: '', en: '' };

function record(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === 'string') out[key] = item;
  }
  return out;
}

export default async function SettingsPage() {
  const user = await currentUser();
  if (!can(user?.role, 'manageSettings')) redirect('/admin');

  const [t, settings] = await Promise.all([
    getTranslations('admin'),
    prisma.siteSetting.findUnique({ where: { id: 'singleton' } }),
  ]);

  return (
    <>
      <PageHeader title={t('nav.settings')} description={t('settings.description')} />
      <SettingsForm
        initial={{
          brandName: asLocalized(settings?.brandName) ?? EMPTY,
          tagline: asLocalized(settings?.tagline) ?? EMPTY,
          primaryCtaLabel: asLocalized(settings?.primaryCtaLabel) ?? EMPTY,
          primaryCtaHref: settings?.primaryCtaHref ?? '',
          externalLmsLabel: settings?.externalLmsLabel ?? '',
          externalLmsUrl: settings?.externalLmsUrl ?? '',
          phones: settings?.phones ?? [],
          email: settings?.email ?? '',
          socials: record(settings?.socials),
          tickerItems: asLocalizedList(settings?.tickerItems),
          currency: settings?.currency ?? 'UZS',
          ga4Id: settings?.ga4Id ?? '',
          metaPixelId: settings?.metaPixelId ?? '',
          yandexMetricaId: settings?.yandexMetricaId ?? '',
          telegramChatIds: record(settings?.telegramChatIds),
          privacyPolicy: asLocalized(settings?.privacyPolicy) ?? EMPTY,
          madeByLabel: asLocalized(settings?.madeByLabel) ?? EMPTY,
          madeByUrl: settings?.madeByUrl ?? '',
          logoLightUrl: settings?.logoLightUrl ?? '',
          ogImageUrl: settings?.ogImageUrl ?? '',
          brandColor: settings?.brandColor ?? DEFAULT_BRAND,
        }}
      />
    </>
  );
}
