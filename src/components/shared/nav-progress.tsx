'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A thin bar across the top while a navigation is in flight.
 *
 * Most pages here are prerendered and arrive instantly, so this is invisible on
 * a good connection — which is the point. On a slow one a click otherwise looks
 * like nothing happened, and people click again.
 *
 * The App Router exposes no global "navigating" flag (`useLinkStatus` only works
 * inside a single Link), so this watches clicks on internal links and clears
 * itself when the path changes.
 */
export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  // The new route rendered: whatever was pending has arrived.
  useEffect(() => {
    setActive(false);
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      // Anything the browser will not handle as a plain in-page navigation:
      // middle click, a modifier held to open a new tab, an already-cancelled
      // event, a download, a link aimed at another window.
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor) return;
      if (anchor.hasAttribute('download')) return;

      const target = anchor.getAttribute('target');
      if (target && target !== '_self') return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      // Same page: no navigation to wait for.
      if (url.pathname === window.location.pathname && url.search === window.location.search)
        return;

      setActive(true);
    }

    // Capture phase on purpose: Next's Link calls preventDefault in its own
    // click handler, so a listener on the bubble phase sees every internal
    // navigation as already cancelled and never fires.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => {
    if (!active) return;
    // A navigation that never resolves — cancelled, or a route that throws —
    // would otherwise leave the bar stuck across the top for good.
    const timer = window.setTimeout(() => setActive(false), 12_000);
    return () => window.clearTimeout(timer);
  }, [active]);

  if (!active) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-100 h-0.5 overflow-hidden"
    >
      <div className="nav-progress h-full bg-brand-600" />
    </div>
  );
}
