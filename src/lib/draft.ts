import 'server-only';
import { draftMode } from 'next/headers';

/**
 * True when the visitor is in Next.js Draft Mode — enabled only for signed-in
 * staff via `/api/draft`. Queries use it to bypass the cache and include
 * unpublished rows so the admin's Preview button shows work in progress.
 *
 * `draftMode()` throws when called during static generation, which is exactly
 * when preview cannot apply, so that case resolves to `false`.
 */
export async function isPreview(): Promise<boolean> {
  try {
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}
