'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { ChevronRight, ExternalLink, LogOut, Menu } from 'lucide-react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { CommandPalette } from '@/components/admin/command-palette';
import { ThemeToggle } from '@/components/admin/theme-toggle';
import { AdminLocaleSwitcher } from '@/components/admin/locale-switcher';
import { ALL_NAV_ITEMS } from '@/components/admin/nav-config';
import { ROLE_LABELS, type Role } from '@/lib/permissions';
import { DEFAULT_LOCALE } from '@/types/i18n';
import { initialsOf } from '@/lib/utils';

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: React.ReactNode;
}) {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const crumbs = buildCrumbs(pathname, t);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar
        role={user.role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-admin-border bg-admin-panel/95 px-4 backdrop-blur-sm md:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t('menu')}
            className="grid size-9 place-items-center rounded-lg text-admin-muted hover:bg-admin-hover lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
            <ol className="flex items-center gap-1.5 text-sm text-admin-muted">
              {crumbs.map((crumb, index) => (
                <li key={crumb.href} className="flex min-w-0 items-center gap-1.5">
                  {index > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden /> : null}
                  {index === crumbs.length - 1 ? (
                    <span className="truncate font-semibold text-admin-text">{crumb.label}</span>
                  ) : (
                    <Link href={crumb.href} className="truncate hover:text-admin-text">
                      {crumb.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <CommandPalette role={user.role} />

          <a
            href={`/${DEFAULT_LOCALE}`}
            target="_blank"
            rel="noopener noreferrer"
            title={t('openSite')}
            className="grid size-9 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-text"
          >
            <ExternalLink className="size-[18px]" aria-hidden />
          </a>

          <AdminLocaleSwitcher />

          <ThemeToggle />

          <div className="flex items-center gap-2 border-s border-admin-border ps-3">
            <span
              aria-hidden
              className="grid size-8 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white"
            >
              {initialsOf(user.name || user.email)}
            </span>
            <div className="hidden leading-tight sm:block">
              <p className="max-w-[10rem] truncate text-sm font-semibold text-admin-text">
                {user.name}
              </p>
              <p className="text-xs text-admin-muted">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/admin/login' })}
              aria-label={t('signOut')}
              className="grid size-9 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-admin-hover hover:text-danger"
            >
              <LogOut className="size-[18px]" aria-hidden />
            </button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function buildCrumbs(
  pathname: string,
  t: (key: string) => string,
): { href: string; label: string }[] {
  const crumbs = [{ href: '/admin', label: t('nav.dashboard') }];
  if (pathname === '/admin') return crumbs;

  const segments = pathname.split('/').filter(Boolean).slice(1);
  let href = '/admin';

  for (const segment of segments) {
    href += `/${segment}`;
    const known = ALL_NAV_ITEMS.find((item) => item.href === href);
    crumbs.push({
      href,
      label: known
        ? t(`nav.${known.labelKey}`)
        : segment === 'new'
          ? t('common.new')
          : decodeURIComponent(segment),
    });
  }

  return crumbs;
}
