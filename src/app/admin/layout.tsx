import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'sonner';
import { inter, poppins } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { getAdminLocale, getAdminMessages } from '@/i18n/admin';
import '../globals.css';

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
  const messages = await getAdminMessages(locale);

  return (
    <html lang={locale} className={cn(inter.variable, poppins.variable)} suppressHydrationWarning>
      <head>
        <script
          // Applies the stored theme before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('admin-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-paper-alt text-ink-900 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="Asia/Tashkent">
          {children}
          <Toaster richColors position="top-right" closeButton />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
