'use client';

import { useEffect } from 'react';

/**
 * Counts a read once per session. Done from the client so the page itself stays
 * statically cacheable.
 */
export function PostViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `post-viewed:${slug}`;
    try {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, '1');
    } catch {
      // Private mode — count it anyway.
    }

    void fetch(`/api/posts/${slug}/view`, { method: 'POST', keepalive: true }).catch(
      () => undefined,
    );
  }, [slug]);

  return null;
}
