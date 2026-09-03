import type { ReactNode } from 'react';

/**
 * Pass-through root layout. `<html>`/`<body>` are rendered by the locale layout
 * (public site) and by the admin layout, because the two areas need different
 * language attributes and colour schemes.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
