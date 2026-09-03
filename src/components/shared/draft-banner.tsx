import { Eye } from 'lucide-react';
import { isPreview } from '@/lib/draft';

/** Route handler that turns Draft Mode off — a real navigation, not a page link. */
const EXIT_HREF = '/api/draft?disable=1';

/**
 * Makes preview state obvious, and offers a way out. Rendered on the public
 * site so staff never mistake a draft for what visitors see.
 */
export async function DraftBanner() {
  if (!(await isPreview())) return null;

  return (
    <div className="relative z-60 flex flex-wrap items-center justify-center gap-3 bg-warning px-4 py-2 text-sm font-semibold text-ink-900">
      <Eye className="size-4" aria-hidden />
      Ko‘rib chiqish rejimi — chop etilmagan o‘zgarishlar ko‘rinmoqda
      <a href={EXIT_HREF} className="underline underline-offset-2 hover:no-underline">
        Chiqish
      </a>
    </div>
  );
}
