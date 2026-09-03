import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';
import { inter, poppins } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import '../globals.css';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

/**
 * The admin panel is not locale-prefixed and renders its own document so it can
 * opt into dark mode (class strategy) independently of the public site.
 */
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz" className={cn(inter.variable, poppins.variable)} suppressHydrationWarning>
      <head>
        <script
          // Applies the stored theme before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('admin-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-paper-alt text-ink-900 antialiased">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
