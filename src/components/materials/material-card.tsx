'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Download, FileText, Headphones, ImageIcon, Play, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DownloadButton } from '@/components/materials/download-button';
import { LiteYouTube, youtubeId } from '@/components/shared/lite-youtube';
import { formatBytes } from '@/lib/upload';
import type { MaterialView } from '@/types/content';

const TYPE_ICON = {
  PDF: FileText,
  AUDIO: Headphones,
  VIDEO: Video,
  PHOTO: ImageIcon,
} as const;

export function MaterialCard({
  material,
  onOpenPhoto,
}: {
  material: MaterialView;
  onOpenPhoto?: () => void;
}) {
  const t = useTranslations('materials');
  const TypeIcon = TYPE_ICON[material.type];

  const meta = [
    material.meta.pages ? `${material.meta.pages} p.` : null,
    material.meta.durationSec ? formatDuration(material.meta.durationSec) : null,
    formatBytes(material.fileSize),
  ].filter(Boolean);

  const isEmbeddedVideo =
    material.type === 'VIDEO' && material.externalUrl && youtubeId(material.externalUrl);

  return (
    <article className="flex h-full flex-col gap-3 rounded-lg border border-ink-300/40 bg-white p-5 shadow-card">
      {isEmbeddedVideo ? (
        <LiteYouTube
          url={material.externalUrl!}
          title={material.title}
          poster={material.coverUrl}
        />
      ) : material.type === 'PHOTO' && material.fileUrl ? (
        <button
          type="button"
          onClick={onOpenPhoto}
          className="relative aspect-16/10 w-full overflow-hidden rounded-md"
          aria-label={t('openGallery')}
        >
          <Image
            src={material.fileUrl}
            alt={material.title}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform hover:scale-105"
          />
        </button>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="brand">
          <TypeIcon className="size-3.5" aria-hidden />
          {t(material.type.toLowerCase())}
        </Badge>
        {material.level ? <Badge variant="outline">{t(`levels.${material.level}`)}</Badge> : null}
        {material.group ? <Badge variant="outline">{material.group.name}</Badge> : null}
      </div>

      <h3 className="text-base md:text-lg">{material.title}</h3>
      {material.description ? (
        <p className="line-clamp-2 text-sm text-ink-600">{material.description}</p>
      ) : null}

      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-ink-600 tabular-nums">
        {meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
        <span>{t('downloads', { count: material.downloadCount })}</span>
      </div>

      {material.type === 'PHOTO' ? (
        <Button variant="outline" size="sm" onClick={onOpenPhoto}>
          <ImageIcon aria-hidden />
          {t('openGallery')}
        </Button>
      ) : isEmbeddedVideo ? (
        <Button variant="outline" size="sm" asChild>
          <a href={material.externalUrl!} target="_blank" rel="noopener noreferrer">
            <Play aria-hidden />
            {t('watch')}
          </a>
        </Button>
      ) : (
        <DownloadButton material={material}>
          <Download aria-hidden />
          {t('download')}
        </DownloadButton>
      )}
    </article>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`;
}
