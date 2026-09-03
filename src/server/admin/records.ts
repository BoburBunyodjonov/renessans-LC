import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { getDelegate, toDecimal, type RecordData } from '@/server/admin/delegates';
import { sanitizeLocalizedHtml } from '@/lib/sanitize';
import { RESOURCE_BY_KEY, type ResourceConfig } from '@/config/admin-resources';
import { LOCALES } from '@/types/i18n';

const localizedSchema = z.object({ uz: z.string(), ru: z.string(), en: z.string() });

/** Builds the payload written to the database from submitted form values. */
export function buildData(config: ResourceConfig, values: RecordData): RecordData {
  const data: RecordData = {};
  const nested: Record<string, RecordData> = {};

  for (const field of config.fields) {
    const [head, tail] = field.name.split('.') as [string, string | undefined];
    const parentValue = values[head] as RecordData | undefined;
    const raw = tail ? parentValue?.[tail] : values[head];
    const target = tail ? (nested[head] ??= {}) : data;
    const key = tail ?? head;

    switch (field.kind) {
      case 'localized':
      case 'localizedText': {
        const parsed = localizedSchema.safeParse(raw);
        target[key] = parsed.success ? parsed.data : Prisma.DbNull;
        break;
      }
      case 'localizedHtml': {
        const parsed = localizedSchema.safeParse(raw);
        target[key] = parsed.success ? sanitizeLocalizedHtml(parsed.data) : Prisma.DbNull;
        break;
      }
      case 'localizedList': {
        const parsed = z.array(localizedSchema).safeParse(raw);
        target[key] = parsed.success ? parsed.data : [];
        break;
      }
      case 'stringList': {
        const parsed = z.array(z.string()).safeParse(raw);
        target[key] = parsed.success ? parsed.data.filter(Boolean) : [];
        break;
      }
      case 'number': {
        const numeric = Number(raw);
        target[key] =
          raw === '' || raw === null || raw === undefined || !Number.isFinite(numeric)
            ? null
            : Math.trunc(numeric);
        break;
      }
      case 'decimal': {
        target[key] = toDecimal(raw);
        break;
      }
      case 'boolean': {
        target[key] = Boolean(raw);
        break;
      }
      case 'date': {
        const value = typeof raw === 'string' && raw ? new Date(raw) : null;
        target[key] = value && !Number.isNaN(value.getTime()) ? value : null;
        break;
      }
      case 'relation': {
        target[key] = typeof raw === 'string' && raw ? raw : null;
        break;
      }
      case 'multiRelation': {
        const ids = z.array(z.string()).safeParse(raw);
        // `set` replaces the whole join list in one statement.
        target[key] = { set: (ids.success ? ids.data : []).map((id) => ({ id })) };
        break;
      }
      case 'curriculum': {
        const parsed = z
          .array(z.object({ title: localizedSchema, items: z.array(localizedSchema) }))
          .safeParse(raw);
        target[key] = parsed.success ? parsed.data : [];
        break;
      }
      default: {
        // text | slug | image | icon | select
        target[key] = typeof raw === 'string' && raw.trim() !== '' ? raw.trim() : null;
      }
    }
  }

  for (const [relation, payload] of Object.entries(nested)) {
    data[relation] = payload;
  }

  return data;
}

export function requiredFieldErrors(
  config: ResourceConfig,
  values: RecordData,
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of config.fields) {
    if (!('required' in field) || !field.required) continue;
    const raw = values[field.name];

    if (
      field.kind === 'localized' ||
      field.kind === 'localizedText' ||
      field.kind === 'localizedHtml'
    ) {
      const parsed = localizedSchema.safeParse(raw);
      if (!parsed.success || !parsed.data.uz.trim()) errors[field.name] = 'UZ matni majburiy';
      continue;
    }

    if (typeof raw !== 'string' || !raw.trim()) errors[field.name] = 'Majburiy maydon';
  }

  return errors;
}

export function resourceConfig(key: string): ResourceConfig | null {
  return RESOURCE_BY_KEY.get(key) ?? null;
}

export function delegateFor(key: string) {
  return getDelegate(key);
}

/** Blank values for a fresh record, so the client form always has a full shape. */
export function emptyValues(config: ResourceConfig): RecordData {
  const values: RecordData = {};
  const blankLocalized = Object.fromEntries(LOCALES.map((locale) => [locale, '']));

  for (const field of config.fields) {
    const [head, tail] = field.name.split('.') as [string, string | undefined];
    const assign = (value: unknown) => {
      if (tail) {
        const parent = (values[head] as RecordData | undefined) ?? {};
        parent[tail] = value;
        values[head] = parent;
      } else {
        values[head] = value;
      }
    };

    switch (field.kind) {
      case 'localized':
      case 'localizedText':
      case 'localizedHtml':
        assign({ ...blankLocalized });
        break;
      case 'localizedList':
      case 'stringList':
      case 'multiRelation':
      case 'curriculum':
        assign([]);
        break;
      case 'boolean':
        assign(['isPublished', 'isVisible', 'isActive', 'isOpen'].includes(field.name));
        break;
      case 'number':
        assign(field.name === 'rating' ? 5 : '');
        break;
      case 'select':
        assign(field.options[0]?.value ?? '');
        break;
      default:
        assign('');
    }
  }

  return values;
}

/** Converts a database row into the flat shape the form expects. */
export function toFormValues(config: ResourceConfig, row: RecordData): RecordData {
  const values = emptyValues(config);

  for (const field of config.fields) {
    const [head, tail] = field.name.split('.') as [string, string | undefined];
    const source = tail ? ((row[head] as RecordData | null) ?? {})[tail] : row[head];
    if (source === undefined) continue;

    let value: unknown = source;
    if (field.kind === 'multiRelation') {
      value = Array.isArray(source)
        ? source.map((entry) => (entry as { id?: string })?.id).filter(Boolean)
        : [];
    } else if (field.kind === 'curriculum') {
      value = Array.isArray(source) ? source : [];
    } else if (field.kind === 'date' && source) {
      value = new Date(source as string).toISOString().slice(0, 10);
    } else if (field.kind === 'decimal' && source !== null) {
      value = String(source);
    } else if (field.kind === 'number' && source !== null) {
      value = String(source);
    } else if (source === null) {
      value =
        field.kind === 'boolean'
          ? false
          : field.kind === 'stringList' || field.kind === 'localizedList'
            ? []
            : '';
    }

    if (tail) {
      const parent = (values[head] as RecordData | undefined) ?? {};
      parent[tail] = value;
      values[head] = parent;
    } else {
      values[head] = value;
    }
  }

  return values;
}
