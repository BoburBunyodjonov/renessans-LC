'use client';

import { DEFAULT_LOCALE } from '@/types/i18n';
import './globals.css';

/** Last-resort boundary: replaces the whole document, so it renders its own shell. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang={DEFAULT_LOCALE}>
      <body className="grid min-h-screen place-items-center bg-paper px-6 text-center text-ink-600">
        <div className="flex flex-col items-center gap-5">
          <p className="text-6xl font-black text-brand-600">!</p>
          <h1 className="text-2xl font-extrabold">Something went wrong</h1>
          {error.digest ? <p className="text-sm">#{error.digest}</p> : null}
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-12 items-center rounded-full bg-brand-600 px-6 font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
