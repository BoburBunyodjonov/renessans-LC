import { absoluteUrl } from '@/lib/utils';
import type { CourseCardView, FaqItemView, SiteSettingsView } from '@/types/content';

/** `EducationalOrganization` for the homepage (PROMPT.md §16). */
export function organizationJsonLd(
  settings: SiteSettingsView,
  locale: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.brandName,
    description: settings.tagline,
    url: absoluteUrl(`/${locale}`),
    ...(settings.logoLightUrl ? { logo: settings.logoLightUrl } : {}),
    ...(settings.phones.length ? { telephone: settings.phones[0] } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    sameAs: Object.values(settings.socials).filter(Boolean),
    areaServed: 'UZ',
  };
}

export function faqJsonLd(items: FaqItemView[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function courseJsonLd(
  course: CourseCardView,
  settings: SiteSettingsView,
  locale: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.shortDesc,
    url: absoluteUrl(`/${locale}/courses/${course.slug}`),
    provider: {
      '@type': 'EducationalOrganization',
      name: settings.brandName,
      sameAs: absoluteUrl(`/${locale}`),
    },
    ...(course.price
      ? {
          offers: {
            '@type': 'Offer',
            price: course.price,
            priceCurrency: course.currency,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
