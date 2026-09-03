import { prisma } from '@/lib/prisma';
import { TAGS, cachedQuery } from '@/lib/cache';
import { loc, locList, locOrNull } from '@/lib/localize';
import type { Locale } from '@/types/i18n';
import type { NavGroups, NavItemView, SiteSettingsView, SocialLinks } from '@/types/content';

const SOCIAL_KEYS = ['telegram', 'instagram', 'youtube', 'facebook', 'tiktok', 'whatsapp'] as const;

function toSocials(value: unknown): SocialLinks {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const out: SocialLinks = {};
  for (const key of SOCIAL_KEYS) {
    const url = record[key];
    if (typeof url === 'string' && url.trim()) out[key] = url.trim();
  }
  return out;
}

const rawSettings = cachedQuery(
  async () => prisma.siteSetting.findUnique({ where: { id: 'singleton' } }),
  ['site:settings'],
  [TAGS.settings],
  { fallback: null },
);

const rawNavItems = cachedQuery(
  async () =>
    prisma.navItem.findMany({
      where: { isVisible: true },
      orderBy: [{ group: 'asc' }, { order: 'asc' }],
    }),
  ['site:nav'],
  [TAGS.nav],
  { fallback: [] },
);

/** Used until an admin fills in the settings row; never rendered once seeded. */
const FALLBACK_SETTINGS: SiteSettingsView = {
  brandName: 'English School',
  tagline: '',
  logoLightUrl: null,
  logoDarkUrl: null,
  faviconUrl: null,
  ogImageUrl: null,
  primaryCtaLabel: '',
  primaryCtaHref: '/choose-level',
  externalLmsLabel: null,
  externalLmsUrl: null,
  phones: [],
  email: null,
  socials: {},
  tickerItems: [],
  currency: 'UZS',
  ga4Id: null,
  metaPixelId: null,
  yandexMetricaId: null,
  privacyPolicy: null,
  madeByLabel: null,
  madeByUrl: null,
};

export async function getSiteSettings(locale: Locale): Promise<SiteSettingsView> {
  const row = await rawSettings();
  if (!row) return FALLBACK_SETTINGS;

  return {
    brandName: loc(row.brandName, locale),
    tagline: loc(row.tagline, locale),
    logoLightUrl: row.logoLightUrl,
    logoDarkUrl: row.logoDarkUrl,
    faviconUrl: row.faviconUrl,
    ogImageUrl: row.ogImageUrl,
    primaryCtaLabel: loc(row.primaryCtaLabel, locale),
    primaryCtaHref: row.primaryCtaHref || '/choose-level',
    externalLmsLabel: row.externalLmsLabel,
    externalLmsUrl: row.externalLmsUrl,
    phones: row.phones,
    email: row.email,
    socials: toSocials(row.socials),
    tickerItems: locList(row.tickerItems, locale),
    currency: row.currency,
    ga4Id: row.ga4Id,
    metaPixelId: row.metaPixelId,
    yandexMetricaId: row.yandexMetricaId,
    privacyPolicy: locOrNull(row.privacyPolicy, locale),
    madeByLabel: locOrNull(row.madeByLabel, locale),
    madeByUrl: row.madeByUrl,
  };
}

export async function getNavigation(locale: Locale): Promise<NavGroups> {
  const rows = await rawNavItems();
  const items: NavItemView[] = rows.map((item) => ({
    id: item.id,
    label: loc(item.label, locale),
    href: item.href,
    group: item.group,
    openInNew: item.openInNew,
  }));

  const byGroup = (group: string) => items.filter((item) => item.group === group);
  const header = byGroup('header');
  const mobile = byGroup('mobile');

  return {
    header,
    mobile: mobile.length ? mobile : header,
    footerPrimary: byGroup('footer-1'),
    footerSecondary: byGroup('footer-2'),
  };
}

/** Telegram chat ids per notification type (Phase 3+). */
export async function getTelegramChatIds(): Promise<Record<string, string>> {
  const row = await rawSettings();
  const value = row?.telegramChatIds;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const [key, chatId] of Object.entries(record)) {
    if (typeof chatId === 'string' && chatId.trim()) out[key] = chatId.trim();
  }
  return out;
}
