'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Copy, Loader2, Trash2, Upload } from 'lucide-react';
import { EmptyState, Panel } from '@/components/admin/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { describeError } from '@/components/admin/form-shell';
import { deleteMediaAsset } from '@/server/actions/settings';
import { formatBytes } from '@/lib/upload';
import { cn } from '@/lib/utils';
import type { MediaAssetRow } from '@/server/queries/media';

export function MediaLibrary({
  rows,
  folders,
  activeFolder,
}: {
  rows: MediaAssetRow[];
  folders: string[];
  activeFolder: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('admin');
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  async function upload(files: FileList) {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set('file', file);
        body.set('kind', file.type.startsWith('image/') ? 'image' : 'document');
        body.set('folder', activeFolder || 'uploads');

        const response = await fetch('/api/upload', { method: 'POST', body });
        if (!response.ok) {
          toast.error(`${file.name}: ${t('errors.uploadFailed')}`);
          continue;
        }
      }
      toast.success(t('common.uploaded'));
      router.refresh();
    } finally {
      setUploading(false);
    }
  }

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel className="flex flex-wrap items-center gap-3">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') setParam('q', query);
          }}
          placeholder={t('media.searchPlaceholder')}
          className="h-10 max-w-xs border-admin-border bg-admin-panel text-admin-text"
        />

        <select
          aria-label={t('media.folder')}
          value={activeFolder}
          onChange={(event) => setParam('folder', event.target.value)}
          className="h-10 rounded-md border border-admin-border bg-admin-panel px-2 text-sm text-admin-text"
        >
          <option value="">{t('media.allFolders')}</option>
          {folders.map((folder) => (
            <option key={folder} value={folder}>
              {folder}
            </option>
          ))}
        </select>

        <Button
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="ms-auto"
        >
          {uploading ? <Loader2 className="animate-spin" aria-hidden /> : <Upload aria-hidden />}
          {t('common.upload')}
        </Button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) void upload(event.target.files);
            event.target.value = '';
          }}
        />
      </Panel>

      {rows.length === 0 ? (
        <EmptyState title={t('media.empty')} description={t('media.uploadFirst')} />
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {rows.map((asset) => {
            const isImage = asset.mimeType.startsWith('image/');
            return (
              <li
                key={asset.id}
                className="rounded-lg border border-admin-border bg-admin-panel p-2"
              >
                <div
                  className={cn('relative aspect-square overflow-hidden rounded-md bg-admin-hover')}
                >
                  {isImage ? (
                    <Image
                      src={asset.url}
                      alt={asset.alt ?? ''}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="grid h-full place-items-center text-xs text-admin-muted">
                      {asset.mimeType.split('/')[1]?.toUpperCase()}
                    </span>
                  )}
                </div>

                <p className="mt-2 truncate text-[0.6875rem] text-admin-muted">
                  {asset.key.split('/').pop()}
                </p>
                <p className="text-[0.6875rem] text-admin-muted tabular-nums">
                  {formatBytes(asset.size)}
                </p>

                <div className="mt-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    title={t('common.copyLink')}
                    onClick={() => {
                      void navigator.clipboard.writeText(asset.url);
                      toast.success(t('common.copied'));
                    }}
                    className="grid size-7 place-items-center rounded-md text-admin-muted hover:bg-admin-hover hover:text-admin-text"
                  >
                    <Copy className="size-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    title={t('common.delete')}
                    disabled={pending}
                    onClick={() => {
                      if (!window.confirm(t('media.deleteConfirm'))) return;
                      startTransition(async () => {
                        const result = await deleteMediaAsset(asset.id);
                        if (result.ok) {
                          toast.success(t('common.deleted'));
                          router.refresh();
                        } else {
                          toast.error(describeError(result.error, t));
                        }
                      });
                    }}
                    className="grid size-7 place-items-center rounded-md text-danger hover:bg-danger/10"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
