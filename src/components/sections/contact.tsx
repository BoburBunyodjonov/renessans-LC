import { getTranslations } from 'next-intl/server';
import { Clock, MapPin, Phone } from 'lucide-react';
import { Section, SectionHeader } from '@/components/ui/section';
import { Reveal } from '@/components/shared/reveal';
import { ContactForm } from '@/components/shared/contact-form';
import { LazyMap } from '@/components/shared/lazy-map';
import { SocialLinksRow } from '@/components/shared/social-links';
import type { BranchView, HomeSectionView, SiteSettingsView } from '@/types/content';
import type { Locale } from '@/types/i18n';

export async function ContactSection({
  branches,
  settings,
  section,
  locale,
}: {
  branches: BranchView[];
  settings: SiteSettingsView;
  section?: HomeSectionView;
  locale: Locale;
}) {
  const [t, tCommon] = await Promise.all([
    getTranslations({ locale, namespace: 'home' }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const mapBranch = branches.find((branch) => branch.mapEmbedUrl);

  return (
    <Section id="contact" tone="alt">
      <SectionHeader
        eyebrow={section?.eyebrow ?? undefined}
        title={section?.title ?? t('sectionContact')}
        subtitle={section?.subtitle ?? undefined}
      />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Reveal className="flex flex-col gap-5">
          <ul className="flex flex-col gap-4">
            {branches.map((branch) => (
              <li
                key={branch.id}
                className="flex flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-6 shadow-card"
              >
                <h3 className="text-lg">{branch.name}</h3>
                <p className="flex items-start gap-2 text-sm text-ink-600">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
                  {branch.address}
                </p>
                {branch.workingHours ? (
                  <p className="flex items-start gap-2 text-sm text-ink-600">
                    <Clock className="mt-0.5 size-4 shrink-0 text-brand-500" aria-hidden />
                    {branch.workingHours}
                  </p>
                ) : null}
                <ul className="flex flex-wrap gap-3">
                  {branch.phones.map((phone) => (
                    <li key={phone}>
                      <a
                        href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-900 transition-colors hover:text-brand-600"
                      >
                        <Phone className="size-4" aria-hidden />
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
                {branch.mapLinkUrl ? (
                  <a
                    href={branch.mapLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {tCommon('showAll')}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <SocialLinksRow socials={settings.socials} />
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="text-sm font-semibold text-ink-600 transition-colors hover:text-brand-600"
              >
                {settings.email}
              </a>
            ) : null}
          </div>
        </Reveal>

        <Reveal
          delay={0.1}
          className="rounded-lg border border-ink-300/40 bg-white p-6 shadow-card md:p-8"
        >
          <ContactForm />
        </Reveal>
      </div>

      {mapBranch?.mapEmbedUrl ? (
        <div className="mt-10">
          <LazyMap embedUrl={mapBranch.mapEmbedUrl} title={mapBranch.name} />
        </div>
      ) : null}
    </Section>
  );
}
