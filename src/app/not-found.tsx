import Link from 'next/link';
import { DEFAULT_LOCALE } from '@/types/i18n';
import './globals.css';

/** Root-level 404 for paths outside the locale segments (e.g. /admin/typo). */
export default function NotFound() {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink-600">
        <div className="flex flex-col items-center gap-5">
          <p className="text-6xl font-black text-brand-500">404</p>
          <h1 className="text-2xl font-extrabold">Page not found</h1>
          <Link
            href={`/${DEFAULT_LOCALE}`}
            className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Go home
          </Link>
        </div>
      </body>
    </html>
  );
}
