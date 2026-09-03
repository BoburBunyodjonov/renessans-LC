'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { MaterialView } from '@/types/content';

/** Keyboard-operable gallery for photo materials. */
export function PhotoLightbox({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: MaterialView[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations('common');
  const current = photos[index];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % photos.length);
      if (event.key === 'ArrowLeft') onIndexChange((index - 1 + photos.length) % photos.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [index, onClose, onIndexChange, photos.length]);

  if (!current?.fileUrl) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={current.title}
      className="fixed inset-0 z-100 flex flex-col bg-black/92 p-4 md:p-8"
    >
      <div className="flex items-center justify-between gap-4 text-white">
        <p className="truncate text-sm font-semibold">{current.title}</p>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label={t('close')}
          className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="relative mt-4 flex-1">
        <Image
          src={current.fileUrl}
          alt={current.title}
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {photos.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-4 text-white">
          <button
            type="button"
            onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
            aria-label={t('back')}
            className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <span className="text-sm tabular-nums">
            {index + 1} / {photos.length}
          </span>
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % photos.length)}
            aria-label={t('next')}
            className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
