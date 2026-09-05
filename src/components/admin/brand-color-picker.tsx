'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Label } from '@/components/ui/field';
import { DEFAULT_BRAND, contrastRatio, deriveBrandScale, normalizeHex } from '@/lib/theme';

/**
 * Picks the one colour the whole palette is built from.
 *
 * Only the base colour is editable; the stops that carry text are derived and
 * darkened until they clear WCAG AA, so the preview below is not decoration —
 * it is what the site will actually paint, and the ratios shown are measured
 * from those derived values rather than promised.
 */
export function BrandColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const t = useTranslations('admin');
  const normalized = normalizeHex(value);
  const scale = useMemo(() => deriveBrandScale(value || DEFAULT_BRAND), [value]);

  // The two ratios worth showing: white text on a button, and the link colour
  // on the page. Both come out of the same derived stop.
  const onWhite = contrastRatio(scale[600], '#ffffff');
  const isDefault = (normalized ?? DEFAULT_BRAND) === DEFAULT_BRAND;

  const swatches: { key: keyof typeof scale; label: string }[] = [
    { key: 50, label: '50' },
    { key: 100, label: '100' },
    { key: 500, label: '500' },
    { key: 600, label: '600' },
    { key: 700, label: '700' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="field-brandColor" className="text-admin-text">
            {t('settings.brandColor')}
          </Label>
          <div className="flex items-center gap-2">
            <input
              id="field-brandColor"
              type="color"
              value={normalized ?? DEFAULT_BRAND}
              onChange={(event) => onChange(event.target.value)}
              className="size-10 cursor-pointer rounded-md border border-admin-border bg-admin-panel p-1"
            />
            <input
              type="text"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              spellCheck={false}
              aria-invalid={normalized === null}
              aria-describedby="brand-colour-hint"
              className="h-10 w-32 rounded-md border border-admin-border bg-admin-panel px-3 font-mono text-sm text-admin-text"
            />
          </div>
        </div>

        {!isDefault ? (
          <button
            type="button"
            onClick={() => onChange(DEFAULT_BRAND)}
            className="h-10 rounded-md border border-admin-border px-3 text-sm font-semibold text-admin-muted transition-colors hover:bg-admin-hover hover:text-admin-text"
          >
            {t('settings.brandColorReset')}
          </button>
        ) : null}
      </div>

      <p id="brand-colour-hint" className="text-sm text-admin-muted">
        {normalized === null ? t('settings.brandColorInvalid') : t('settings.brandColorHint')}
      </p>

      {/*
        The preview sits on white whatever theme the panel is in, because the
        public site has no dark mode — these colours are only ever painted on a
        light page, and judging them against a dark panel would mislead.
        `data-color-preview` exempts the block from the admin theme check, which
        otherwise (correctly) objects to light surfaces in dark mode.
      */}
      <div
        data-color-preview
        className="flex flex-col gap-4 rounded-lg border border-admin-border bg-white p-4"
      >
        <div className="flex flex-wrap gap-2" aria-hidden>
          {swatches.map((swatch) => (
            <div key={swatch.label} className="flex flex-col items-center gap-1">
              <div
                className="size-12 rounded-md border border-ink-300/50"
                style={{ background: scale[swatch.key] }}
              />
              <span className="font-mono text-[0.625rem] text-ink-600">{swatch.label}</span>
            </div>
          ))}
        </div>

        {/* Rendered as components rather than swatches: a colour is easy to
            misjudge as a square and obvious as a button. */}
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-bold text-white"
            style={{ background: scale[600] }}
          >
            {t('settings.brandColorPreviewButton')}
          </span>
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase"
            style={{ background: scale[50], color: scale[600] }}
          >
            {t('settings.brandColorPreviewChip')}
          </span>
          <span className="text-sm font-semibold" style={{ color: scale[600] }}>
            {t('settings.brandColorPreviewLink')}
          </span>
        </div>
      </div>

      <p className="text-sm text-admin-muted">
        {t('settings.brandColorContrast', { ratio: onWhite.toFixed(2) })}
      </p>
    </div>
  );
}
