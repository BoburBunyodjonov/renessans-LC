'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { ExternalLink, Menu, Phone, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { LangSwitcher } from '@/components/shared/lang-switcher';
import { SocialLinksRow } from '@/components/shared/social-links';
import type { NavGroups, SiteSettingsView } from '@/types/content';
import type { Locale } from '@/types/i18n';
import { cn } from '@/lib/utils';

export function Header({
  settings,
  nav,
  locale,
}: {
  settings: SiteSettingsView;
  nav: NavGroups;
  locale: Locale;
}) {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The menu is portalled to <body>, which only exists after mount.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-(--header-height) w-full transition-shadow duration-300',
        scrolled ? 'bg-white/85 shadow-card backdrop-blur-md' : 'bg-white',
      )}
    >
      <Container className="flex h-full items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label={settings.brandName}>
          <span
            aria-hidden
            className="grid size-10 place-items-center rounded-2xl bg-brand-600 text-lg font-black text-white"
          >
            R
          </span>
          <span className="hidden font-display text-base leading-tight font-extrabold text-ink-900 sm:block">
            {settings.brandName}
          </span>
        </Link>

        <SocialLinksRow socials={settings.socials} size="sm" className="ms-2 hidden xl:flex" />

        <div className="ms-auto flex items-center gap-2">
          {settings.externalLmsUrl && settings.externalLmsLabel ? (
            <a
              href={settings.externalLmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-10 items-center gap-1.5 rounded-full border border-ink-300/60 px-4 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900 lg:inline-flex"
            >
              {settings.externalLmsLabel}
              <ExternalLink className="size-4" aria-hidden />
            </a>
          ) : null}

          <LangSwitcher locale={locale} className="hidden sm:block" />

          <Button size="sm" variant="brand" asChild className="hidden md:inline-flex">
            <Link href={settings.primaryCtaHref}>{settings.primaryCtaLabel}</Link>
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label={t('openMenu')}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            className="inline-flex size-10 items-center justify-center rounded-full border border-ink-300/60 text-ink-900 transition-colors hover:border-ink-900"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </Container>

      {/* Rendered through a portal: once the header picks up `backdrop-blur`
          on scroll it becomes the containing block for fixed children, which
          would clip this overlay to the header's height. */}
      {menuOpen && mounted
        ? createPortal(
            <div
              id="site-menu"
              role="dialog"
              aria-modal="true"
              aria-label={t('menu')}
              className="fixed inset-0 z-100 flex flex-col bg-white"
            >
              <Container className="flex h-(--header-height) shrink-0 items-center justify-between">
                <span className="font-display text-base font-extrabold text-ink-900">
                  {settings.brandName}
                </span>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setMenuOpen(false)}
                  aria-label={t('closeMenu')}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-ink-300/60 text-ink-900 transition-colors hover:border-ink-900"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </Container>

              <Container className="flex flex-1 flex-col gap-8 overflow-y-auto pt-6 pb-10">
                <nav aria-label={t('menu')}>
                  <ul className="flex flex-col">
                    {nav.mobile.map((item) => (
                      <li key={item.id} className="border-b border-ink-300/40">
                        <Link
                          href={item.href}
                          className="block py-4 font-display text-2xl font-extrabold text-ink-900 transition-colors hover:text-brand-600"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="flex flex-col gap-4">
                  <Button size="lg" block asChild>
                    <Link href={settings.primaryCtaHref}>{settings.primaryCtaLabel}</Link>
                  </Button>

                  <div className="flex flex-wrap items-center gap-3">
                    <LangSwitcher locale={locale} />
                    <SocialLinksRow socials={settings.socials} />
                  </div>

                  <ul className="flex flex-col gap-1">
                    {settings.phones.map((phone) => (
                      <li key={phone}>
                        <a
                          href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                          className="inline-flex items-center gap-2 font-semibold text-ink-900 transition-colors hover:text-brand-600"
                        >
                          <Phone className="size-4" aria-hidden />
                          {phone}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Container>
            </div>,
            document.body,
          )
        : null}
    </header>
  );
}
