'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Extracts the video id from watch/youtu.be/embed URLs. */
export function youtubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

/**
 * Poster-first YouTube embed: the iframe is only created after a click, so the
 * homepage never pays for the YouTube player (PROMPT.md §7.5).
 */
export function LiteYouTube({
  url,
  title,
  poster,
  className,
}: {
  url: string;
  title: string;
  poster?: string | null;
  className?: string;
}) {
  const [active, setActive] = useState(false);
  const id = youtubeId(url);
  if (!id) return null;

  const thumbnail = poster ?? `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

  return (
    <div className={cn('relative aspect-video overflow-hidden rounded-lg bg-black', className)}>
      {active ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setActive(true)}
          className="group absolute inset-0 size-full cursor-pointer"
          aria-label={title}
        >
          <Image
            src={thumbnail}
            alt=""
            fill
            sizes="(min-width: 1024px) 560px, 100vw"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-16 place-items-center rounded-full bg-brand-600 text-white shadow-brand transition-transform group-hover:scale-110 md:size-20">
              <Play className="size-7 translate-x-0.5 fill-current md:size-8" aria-hidden />
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
