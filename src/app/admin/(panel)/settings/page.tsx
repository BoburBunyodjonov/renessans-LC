import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/admin/ui';
import { SettingsForm } from '@/components/admin/settings-form';
import { currentUser } from '@/server/actions/helpers';
import { can } from '@/lib/permissions';
import { asLocalized, asLocalizedList, type Localized } from '@/types/i18n';
import { DEFAULT_BRAND } from '@/lib/theme';
import { toConfig } from '@/lib/edutizim-payload';
import { maskHint, open as openSecret } from '@/lib/secret-box';
import { DEFAULT_BASE_URL } from '@/server/services/edutizim';

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

  // The key is opened here only to show its last four characters back; the
  // plain value never leaves the server.
  const edutizim = toConfig(settings?.edutizim);
  const storedKey = edutizim.apiKeySealed ? openSecret(edutizim.apiKeySealed) : null;

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
          edutizim: {
            enabled: edutizim.enabled,
            baseUrl: edutizim.baseUrl ?? DEFAULT_BASE_URL,
            organization: edutizim.organization ?? '',
            // Write-only: the stored key is not sent, only whether there is one.
            apiKey: '',
            clearApiKey: false,
            surveyNumber: edutizim.surveyNumber ?? '',
            surveyId: edutizim.surveyId ?? '',
            branchId: edutizim.branchId ?? '',
            scoreFieldId: edutizim.scoreFieldId ?? '',
            levelFieldId: edutizim.levelFieldId ?? '',
            kindFieldId: edutizim.kindFieldId ?? '',
          },
        }}
        apiKeySet={storedKey !== null}
        apiKeyHint={storedKey ? maskHint(storedKey) : ''}
      />
    </>
  );
}
