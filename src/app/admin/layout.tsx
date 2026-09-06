import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { getAdminLocale, getAdminMessages } from '@/i18n/admin';
import { getBrandScale } from '@/server/queries/site';
import { themeCss } from '@/lib/theme';
import '../globals.css';
import { NavProgress } from '@/components/shared/nav-progress';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

/**
 * The admin panel is not locale-prefixed and renders its own document so it can
 * opt into dark mode (class strategy) independently of the public site.
 */
export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();
  const [messages, brand] = await Promise.all([getAdminMessages(locale), getBrandScale()]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          // Applies the stored theme before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('admin-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
        {/* The panel wears the same brand as the site it edits. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss(brand) }} />
      </head>
      {/* Admin surface tokens, not the public palette: `--admin-*` is what the
          `.dark` block swaps. `bg-paper-alt`/`text-ink-900` are light-only, so in
          dark mode the page stayed light while every child switched to light-on-dark
          text — the dashboard heading rendered near-white on near-white. */}
      <body className="min-h-screen bg-admin-bg text-admin-text antialiased">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Tashkent">
          <NavProgress />
          {children}
          <Toaster richColors position="top-right" closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
