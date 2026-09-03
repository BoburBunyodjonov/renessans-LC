'use client';

import { useState, type ReactNode } from 'react';
import { Copy } from 'lucide-react';
import { Input, Label, Textarea } from '@/components/ui/field';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { LOCALES, LOCALE_SHORT, type Locale, type Localized } from '@/types/i18n';
import { cn } from '@/lib/utils';

export const EMPTY_LOCALIZED: Localized = { uz: '', ru: '', en: '' };

type BaseProps = {
  label: string;
  value: Localized;
  onChange: (value: Localized) => void;
  hint?: string;
  required?: boolean;
  error?: string;
  id: string;
};

/** UZ | RU | EN tabs with per-locale fill indicators and a "copy from UZ" helper. */
function LocaleTabs({
  value,
  active,
  onSelect,
  onCopyFromUz,
  id,
}: {
  value: Localized;
  active: Locale;
  onSelect: (locale: Locale) => void;
  onCopyFromUz: () => void;
  id: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div role="tablist" aria-label="Til" className="flex gap-1">
        {LOCALES.map((locale) => {
          const filled = Boolean(value[locale]?.trim());
          return (
            <button
              key={locale}
              type="button"
              role="tab"
              id={`${id}-tab-${locale}`}
              aria-selected={locale === active}
              onClick={() => onSelect(locale)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-colors',
                locale === active
                  ? 'bg-brand-600 text-white'
                  : 'text-admin-muted hover:bg-admin-hover',
              )}
            >
              {LOCALE_SHORT[locale]}
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  filled ? 'bg-success' : locale === active ? 'bg-white/50' : 'bg-ink-300',
                )}
              />
            </button>
          );
        })}
      </div>

      {active !== 'uz' ? (
        <button
          type="button"
          onClick={onCopyFromUz}
          title="UZ dan nusxalash"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-admin-muted hover:bg-admin-hover hover:text-admin-text"
        >
          <Copy className="size-3.5" aria-hidden />
          UZ dan
        </button>
      ) : null}
    </div>
  );
}

function useLocaleState(value: Localized, onChange: (next: Localized) => void) {
  const [active, setActive] = useState<Locale>('uz');
  const set = (next: string) => onChange({ ...value, [active]: next });
  const copyFromUz = () => onChange({ ...value, [active]: value.uz });
  return { active, setActive, set, copyFromUz };
}

function FieldFrame({
  label,
  hint,
  required,
  error,
  id,
  tabs,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  id: string;
  tabs: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id} className="text-admin-text">
          {label}
          {required ? <span className="ms-1 text-danger">*</span> : null}
        </Label>
        {tabs}
      </div>
      {children}
      {hint ? <p className="text-xs text-admin-muted">{hint}</p> : null}
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputTheme = 'border-admin-border bg-admin-panel text-admin-text';

export function LocalizedInput({ label, value, onChange, hint, required, error, id }: BaseProps) {
  const { active, setActive, set, copyFromUz } = useLocaleState(value, onChange);

  return (
    <FieldFrame
      label={label}
      hint={hint}
      required={required}
      error={error}
      id={id}
      tabs={
        <LocaleTabs
          value={value}
          active={active}
          onSelect={setActive}
          onCopyFromUz={copyFromUz}
          id={id}
        />
      }
    >
      <Input
        id={id}
        value={value[active] ?? ''}
        onChange={(event) => set(event.target.value)}
        aria-invalid={Boolean(error)}
        className={inputTheme}
      />
    </FieldFrame>
  );
}

export function LocalizedTextarea({
  label,
  value,
  onChange,
  hint,
  required,
  error,
  id,
  rows = 4,
}: BaseProps & { rows?: number }) {
  const { active, setActive, set, copyFromUz } = useLocaleState(value, onChange);

  return (
    <FieldFrame
      label={label}
      hint={hint}
      required={required}
      error={error}
      id={id}
      tabs={
        <LocaleTabs
          value={value}
          active={active}
          onSelect={setActive}
          onCopyFromUz={copyFromUz}
          id={id}
        />
      }
    >
      <Textarea
        id={id}
        rows={rows}
        value={value[active] ?? ''}
        onChange={(event) => set(event.target.value)}
        aria-invalid={Boolean(error)}
        className={inputTheme}
      />
    </FieldFrame>
  );
}

/** Rich text per locale (Tiptap). HTML is sanitized server-side on save. */
export function LocalizedEditor({ label, value, onChange, hint, required, error, id }: BaseProps) {
  const { active, setActive, set, copyFromUz } = useLocaleState(value, onChange);

  return (
    <FieldFrame
      label={label}
      hint={hint}
      required={required}
      error={error}
      id={id}
      tabs={
        <LocaleTabs
          value={value}
          active={active}
          onSelect={setActive}
          onCopyFromUz={copyFromUz}
          id={id}
        />
      }
    >
      <RichTextEditor key={active} value={value[active] ?? ''} onChange={set} />
    </FieldFrame>
  );
}

/** Localized string list (bullet points, ticker items, …). */
export function LocalizedList({
  label,
  value,
  onChange,
  hint,
  id,
}: {
  label: string;
  value: Localized[];
  onChange: (value: Localized[]) => void;
  hint?: string;
  id: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-admin-text">{label}</Label>
        <button
          type="button"
          onClick={() => onChange([...value, { ...EMPTY_LOCALIZED }])}
          className="text-xs font-bold text-brand-600 hover:text-brand-700"
        >
          + Qo‘shish
        </button>
      </div>

      {value.map((item, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            <LocalizedInput
              id={`${id}-${index}`}
              label={`${index + 1}`}
              value={item}
              onChange={(next) => onChange(value.map((entry, i) => (i === index ? next : entry)))}
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(value.filter((_, i) => i !== index))}
            className="mt-7 rounded-md px-2 py-1 text-xs font-bold text-danger hover:bg-danger/10"
          >
            O‘chirish
          </button>
        </div>
      ))}

      {hint ? <p className="text-xs text-admin-muted">{hint}</p> : null}
    </div>
  );
}
