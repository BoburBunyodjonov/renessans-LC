'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { ImageOff, Loader2, Trash2, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/field';
import { formatBytes } from '@/lib/upload';
import { cn } from '@/lib/utils';

type MediaItem = {
  id: string;
  url: string;
  key: string;
  mimeType: string;
  size: number;
};

const WARN_BYTES = 500 * 1024;

/**
 * Picks an image from the media library or uploads one inline. Returns the URL
 * to the form; alt text is edited alongside it by the caller.
 */
export function MediaPicker({
  label,
  value,
  onChange,
  folder = 'images',
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  folder?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/media?folder=${encodeURIComponent(folder)}`);
      const payload = (await response.json()) as { data?: { rows: MediaItem[] } };
      setItems(payload.data?.rows ?? []);
    } catch {
      toast.error('Media ro‘yxatini yuklab bo‘lmadi');
    } finally {
      setLoading(false);
    }
  }, [folder]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  async function upload(file: File) {
    setUploading(true);
    const body = new FormData();
    body.set('file', file);
    body.set('kind', 'image');
    body.set('folder', folder);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body });
      const payload = (await response.json()) as { ok: boolean; data?: MediaItem };
      if (!response.ok || !payload.data) {
        toast.error('Faylni yuklab bo‘lmadi');
        return;
      }
      if (file.size > WARN_BYTES) {
        toast.warning(`Fayl hajmi ${formatBytes(file.size)} — 500 KB dan katta`);
      }
      onChange(payload.data.url);
      setItems((current) => [payload.data!, ...current]);
      setOpen(false);
      toast.success('Yuklandi');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-admin-text">{label}</Label>

      <div className="flex flex-wrap items-start gap-3">
        <div className="relative grid size-28 shrink-0 place-items-center overflow-hidden rounded-md border border-admin-border bg-admin-hover">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="112px"
              className="object-cover"
              onLoad={(event) => {
                const target = event.currentTarget;
                setDimensions({ width: target.naturalWidth, height: target.naturalHeight });
              }}
            />
          ) : (
            <ImageOff className="size-6 text-admin-muted" aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(true)}
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              Kutubxonadan tanlash
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="border-admin-border text-admin-text hover:bg-admin-hover hover:text-admin-text"
            >
              {uploading ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <Upload aria-hidden />
              )}
              Yuklash
            </Button>
            {value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  onChange(null);
                  setDimensions(null);
                }}
                className="text-danger hover:bg-danger/10"
              >
                <Trash2 aria-hidden />
                Olib tashlash
              </Button>
            ) : null}
          </div>

          <Input
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value || null)}
            placeholder="https://..."
            className="h-10 w-full max-w-md border-admin-border bg-admin-panel text-sm text-admin-text"
          />

          {dimensions ? (
            <p className="text-xs text-admin-muted tabular-nums">
              {dimensions.width}×{dimensions.height}px
            </p>
          ) : null}
          {hint ? <p className="text-xs text-admin-muted">{hint}</p> : null}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
          event.target.value = '';
        }}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Media kutubxonasi</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="grid h-64 place-items-center">
              <Loader2 className="size-6 animate-spin text-brand-600" aria-hidden />
            </div>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-600">Hozircha fayl yo‘q</p>
          ) : (
            <ul className="grid max-h-[60vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className={cn(
                      'relative block aspect-square w-full overflow-hidden rounded-md border-2 transition-colors',
                      value === item.url
                        ? 'border-brand-600'
                        : 'border-transparent hover:border-ink-300',
                    )}
                  >
                    <Image src={item.url} alt="" fill sizes="150px" className="object-cover" />
                  </button>
                  <p className="mt-1 truncate text-[0.6875rem] text-ink-600">
                    {formatBytes(item.size)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
