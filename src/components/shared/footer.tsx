import { Mail, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Container } from '@/components/ui/container';
import { SocialLinksRow } from '@/components/shared/social-links';
import type { NavGroups, SiteSettingsView } from '@/types/content';

export function Footer({ settings, nav }: { settings: SiteSettingsView; nav: NavGroups }) {
  const t = useTranslations('nav');
  const year = new Date().getFullYear();
  const columns = [nav.footerPrimary, nav.footerSecondary].filter((column) => column.length > 0);

  return (
    <footer className="bg-ink-900 text-white/70">
      <Container className="py-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white"
              >
                R
              </span>
              <span className="font-display text-base leading-tight font-extrabold text-white">
                {settings.brandName}
              </span>
            </Link>
            <p className="max-w-xs text-sm">{settings.tagline}</p>
            <SocialLinksRow
              socials={settings.socials}
              itemClassName="border-white/20 text-white/80 hover:border-white hover:text-white"
            />
          </div>

          {columns.map((column, index) => (
            <nav key={index} aria-label={`footer-${index + 1}`} className="flex flex-col gap-3">
              <ul className="flex flex-col gap-2.5 text-sm">
                {column.map((item) => (
                  <li key={item.id}>
                    <Link href={item.href} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col gap-3 text-sm">
            <ul className="flex flex-col gap-2">
              {settings.phones.map((phone) => (
                <li key={phone}>
                  <a
                    href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                    className="inline-flex items-center gap-2 font-semibold text-white transition-colors hover:text-white/80"
                  >
                    <Phone className="size-4" aria-hidden />
                    {phone}
                  </a>
                </li>
              ))}
            </ul>
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-white"
              >
                <Mail className="size-4" aria-hidden />
                {settings.email}
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {settings.brandName}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              {t('privacy')}
            </Link>
            {settings.madeByLabel ? (
              settings.madeByUrl ? (
                <a
                  href={settings.madeByUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-white"
                >
                  {settings.madeByLabel}
                </a>
              ) : (
                <span>{settings.madeByLabel}</span>
              )
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
