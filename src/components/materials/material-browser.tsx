'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Input } from '@/components/ui/field';
import { Button } from '@/components/ui/button';
import { MaterialCard } from '@/components/materials/material-card';
import { PhotoLightbox } from '@/components/materials/photo-lightbox';
import { cn } from '@/lib/utils';
import type { MaterialGroupView, MaterialLevelKey, MaterialView } from '@/types/content';

/**
 * Filtering happens in the browser over the ISR-rendered list, and every change
 * is written back to the URL, so a reload (or a shared link) restores the exact
 * same view (PROMPT.md §9).
 */
export function MaterialBrowser({
  materials,
  groups,
  levels,
}: {
  materials: MaterialView[];
  groups: MaterialGroupView[];
  levels: MaterialLevelKey[];
}) {
  const t = useTranslations('materials');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedLevels, setSelectedLevels] = useState<string[]>(() =>
    (searchParams.get('level') ?? '').split(',').filter(Boolean),
  );
  const [selectedGroups, setSelectedGroups] = useState<string[]>(() =>
    (searchParams.get('group') ?? '').split(',').filter(Boolean),
  );
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 250);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Keep the URL in step with the filters (replace, so Back leaves the page).
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedLevels.length) params.set('level', selectedLevels.join(','));
    if (selectedGroups.length) params.set('group', selectedGroups.join(','));
    if (debouncedQuery.trim()) params.set('q', debouncedQuery.trim());

    const next = params.toString();
    if (next === searchParams.toString()) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [debouncedQuery, pathname, router, searchParams, selectedGroups, selectedLevels]);

  const toggle = useCallback((value: string, list: string[], setList: (next: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }, []);

  const filtered = useMemo(() => {
    const needle = debouncedQuery.trim().toLowerCase();
    return materials.filter((material) => {
      if (selectedLevels.length && (!material.level || !selectedLevels.includes(material.level))) {
        return false;
      }
      if (
        selectedGroups.length &&
        (!material.group || !selectedGroups.includes(material.group.id))
      ) {
        return false;
      }
      if (!needle) return true;
      return (
        material.title.toLowerCase().includes(needle) ||
        material.description?.toLowerCase().includes(needle) ||
        material.tags.some((tag) => tag.toLowerCase().includes(needle))
      );
    });
  }, [debouncedQuery, materials, selectedGroups, selectedLevels]);

  const photos = useMemo(
    () => filtered.filter((material) => material.type === 'PHOTO' && material.fileUrl),
    [filtered],
  );

  const hasFilters = selectedLevels.length > 0 || selectedGroups.length > 0 || query.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {levels.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={t('level')}>
            {levels.map((level) => (
              <li key={level}>
                <Chip
                  active={selectedLevels.includes(level)}
                  onClick={() => toggle(level, selectedLevels, setSelectedLevels)}
                >
                  {t(`levels.${level}`)}
                </Chip>
              </li>
            ))}
          </ul>
        ) : null}

        {groups.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label={t('group')}>
            {groups.map((group) => (
              <li key={group.id}>
                <Chip
                  active={selectedGroups.includes(group.id)}
                  onClick={() => toggle(group.id, selectedGroups, setSelectedGroups)}
                >
                  {group.name}
                </Chip>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search
              className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-600"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={tCommon('search')}
              className="ps-11"
            />
          </div>

          {hasFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedLevels([]);
                setSelectedGroups([]);
                setQuery('');
              }}
            >
              <X aria-hidden />
              {t('resetFilters')}
            </Button>
          ) : null}

          <p className="ms-auto text-sm text-ink-600 tabular-nums">
            {t('itemsCount', { count: filtered.length })}
          </p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-ink-300/50 p-10 text-center text-ink-600">
          {t('empty')}
        </p>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((material) => (
            <li key={material.id}>
              <MaterialCard
                material={material}
                onOpenPhoto={
                  material.type === 'PHOTO'
                    ? () => setLightboxIndex(photos.findIndex((item) => item.id === material.id))
                    : undefined
                }
              />
            </li>
          ))}
        </ul>
      )}

      {lightboxIndex !== null && photos.length > 0 ? (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-ink-300/60 bg-white text-ink-600 hover:border-ink-900',
      )}
    >
      {children}
    </button>
  );
}
