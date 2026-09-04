'use client';

import { Input, Label, Textarea } from '@/components/ui/field';
import { useTranslations } from 'next-intl';
import {
  LocalizedEditor,
  LocalizedInput,
  LocalizedList,
  LocalizedTextarea,
} from '@/components/admin/localized-input';
import { MediaPicker } from '@/components/admin/media-picker';
import { ICON_NAMES } from '@/components/shared/icon';
import type { FieldSpec } from '@/config/admin-resources';
import type { Localized } from '@/types/i18n';

type CurriculumBlock = { title: Localized; items: Localized[] };
import { cn } from '@/lib/utils';

const inputTheme = 'border-admin-border bg-admin-panel text-admin-text';

export type FieldValue = unknown;

/** Renders one field of a generic resource form. */
export function ResourceField({
  field,
  label,
  hint,
  value,
  onChange,
  error,
  relationOptions,
}: {
  field: FieldSpec;
  /** Translated label; falls back to the registry literal. */
  label?: string;
  hint?: string;
  value: FieldValue;
  onChange: (next: FieldValue) => void;
  error?: string;
  relationOptions?: { value: string; label: string }[];
}) {
  const t = useTranslations('admin');
  const id = `field-${field.name.replace(/\./g, '-')}`;
  const fieldLabel = label ?? field.label;
  const fieldHint = hint ?? ('hint' in field ? field.hint : undefined);
  const localized = (value ?? { uz: '', ru: '', en: '' }) as Localized;

  switch (field.kind) {
    case 'localized':
      return (
        <LocalizedInput
          id={id}
          label={fieldLabel}
          hint={fieldHint}
          required={field.required}
          error={error}
          value={localized}
          onChange={onChange}
        />
      );

    case 'localizedText':
      return (
        <LocalizedTextarea
          id={id}
          label={fieldLabel}
          hint={fieldHint}
          required={field.required}
          error={error}
          rows={field.rows}
          value={localized}
          onChange={onChange}
        />
      );

    case 'localizedHtml':
      return (
        <LocalizedEditor
          id={id}
          label={fieldLabel}
          hint={fieldHint}
          required={field.required}
          error={error}
          value={localized}
          onChange={onChange}
        />
      );

    case 'localizedList':
      return (
        <LocalizedList
          id={id}
          label={fieldLabel}
          hint={fieldHint}
          value={(value as Localized[]) ?? []}
          onChange={onChange}
        />
      );

    case 'stringList': {
      const items = (value as string[]) ?? [];
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-admin-text">{fieldLabel}</Label>
            <button
              type="button"
              onClick={() => onChange([...items, ''])}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              + {t('common.add')}
            </button>
          </div>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={item}
                onChange={(event) =>
                  onChange(items.map((entry, i) => (i === index ? event.target.value : entry)))
                }
                className={inputTheme}
              />
              <button
                type="button"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="rounded-md px-3 text-xs font-bold text-danger hover:bg-danger/10"
              >
                ✕
              </button>
            </div>
          ))}
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );
    }

    case 'boolean':
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-admin-border p-3">
          <input
            type="checkbox"
            className="size-4 accent-brand-600"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
          />
          <span className="text-sm font-semibold text-admin-text">{fieldLabel}</span>
          {fieldHint ? <span className="text-xs text-admin-muted">{fieldHint}</span> : null}
        </label>
      );

    case 'image':
      return (
        <MediaPicker
          label={fieldLabel}
          hint={fieldHint}
          folder={field.folder}
          value={(value as string) || null}
          onChange={(url) => onChange(url ?? '')}
        />
      );

    case 'icon':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
          </Label>
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputTheme, 'h-12 w-full rounded-sm border px-3')}
          >
            <option value="">—</option>
            {ICON_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );

    case 'select':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
          </Label>
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputTheme, 'h-12 w-full rounded-sm border px-3')}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'relation':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
          </Label>
          <select
            id={id}
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={cn(inputTheme, 'h-12 w-full rounded-sm border px-3')}
          >
            <option value="">—</option>
            {(relationOptions ?? []).map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );

    case 'multiRelation': {
      const selected = (value as string[]) ?? [];
      return (
        <div className="flex flex-col gap-2">
          <Label className="text-admin-text">{fieldLabel}</Label>
          <div className="grid gap-1.5 rounded-md border border-admin-border p-3 sm:grid-cols-2">
            {(relationOptions ?? []).length === 0 ? (
              <p className="text-sm text-admin-muted">{t('common.emptyList')}</p>
            ) : (
              (relationOptions ?? []).map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 text-sm text-admin-text"
                >
                  <input
                    type="checkbox"
                    className="size-4 accent-brand-600"
                    checked={selected.includes(option.value)}
                    onChange={(event) =>
                      onChange(
                        event.target.checked
                          ? [...selected, option.value]
                          : selected.filter((id) => id !== option.value),
                      )
                    }
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );
    }

    case 'curriculum': {
      const blocks = (value as CurriculumBlock[]) ?? [];
      const blank: Localized = { uz: '', ru: '', en: '' };

      const updateBlock = (index: number, next: CurriculumBlock) =>
        onChange(blocks.map((block, i) => (i === index ? next : block)));

      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-admin-text">{fieldLabel}</Label>
            <button
              type="button"
              onClick={() => onChange([...blocks, { title: { ...blank }, items: [] }])}
              className="text-xs font-bold text-brand-600 hover:text-brand-700"
            >
              + Modul
            </button>
          </div>

          {blocks.map((block, blockIndex) => (
            <div
              key={blockIndex}
              className="flex flex-col gap-3 rounded-md border border-admin-border p-4"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <LocalizedInput
                    id={`${id}-${blockIndex}-title`}
                    label={`Modul ${blockIndex + 1}`}
                    value={block.title ?? { ...blank }}
                    onChange={(title) => updateBlock(blockIndex, { ...block, title })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onChange(blocks.filter((_, i) => i !== blockIndex))}
                  className="mt-7 rounded-md px-2 py-1 text-xs font-bold text-danger hover:bg-danger/10"
                >
                  O‘chirish
                </button>
              </div>

              <LocalizedList
                id={`${id}-${blockIndex}-items`}
                label="Mavzular"
                value={block.items ?? []}
                onChange={(items) => updateBlock(blockIndex, { ...block, items })}
              />
            </div>
          ))}

          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );
    }

    case 'date':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
          </Label>
          <Input
            id={id}
            type="date"
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={inputTheme}
          />
        </div>
      );

    case 'number':
    case 'decimal':
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
          </Label>
          <Input
            id={id}
            type="number"
            inputMode="decimal"
            value={(value as string) ?? ''}
            onChange={(event) => onChange(event.target.value)}
            className={inputTheme}
          />
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
        </div>
      );

    default: {
      const isLong = field.kind === 'text' && field.name.toLowerCase().includes('url');
      return (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={id} className="text-admin-text">
            {fieldLabel}
            {'required' in field && field.required ? (
              <span className="ms-1 text-danger">*</span>
            ) : null}
          </Label>
          {isLong ? (
            <Textarea
              id={id}
              rows={2}
              value={(value as string) ?? ''}
              onChange={(event) => onChange(event.target.value)}
              className={inputTheme}
            />
          ) : (
            <Input
              id={id}
              value={(value as string) ?? ''}
              onChange={(event) => onChange(event.target.value)}
              placeholder={'placeholder' in field ? field.placeholder : undefined}
              aria-invalid={Boolean(error)}
              className={inputTheme}
            />
          )}
          {fieldHint ? <p className="text-xs text-admin-muted">{fieldHint}</p> : null}
          {error ? (
            <p role="alert" className="text-xs text-danger">
              {error}
            </p>
          ) : null}
        </div>
      );
    }
  }
}
