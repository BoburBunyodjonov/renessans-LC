import type { ColumnSpec, FieldSpec, ResourceConfig } from '@/config/admin-resources';

/**
 * Shape shared by `useTranslations` (client) and `getTranslations` (server), so
 * the same resolver serves both.
 */
type Translator = ((key: string) => string) & { has: (key: string) => boolean };

/**
 * Resolves the copy for a resource from the message files, falling back through
 * a per-resource override, then the shared field dictionary, then the literal in
 * the registry. That fallback chain means a new field renders its English-ish
 * registry label rather than a raw key if its translation is still missing.
 */
export function resourceLabels(config: ResourceConfig, t: Translator) {
  const pick = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const forField = (name: string, fallback: string) =>
    pick(`resources.${config.key}.fields.${name}`, pick(`fields.${name}`, fallback));

  return {
    title: pick(`resources.${config.key}.title`, config.title),
    singular: pick(`resources.${config.key}.singular`, config.singular),
    description: config.description
      ? pick(`resources.${config.key}.description`, config.description)
      : undefined,
    field: (field: FieldSpec) => forField(field.name, field.label),
    column: (column: ColumnSpec) => forField(column.name, column.label),
    hint: (field: FieldSpec) => {
      const fallback = 'hint' in field ? field.hint : undefined;
      return pick(`resources.${config.key}.hints.${field.name}`, fallback ?? '') || undefined;
    },
  };
}

export type ResourceLabels = ReturnType<typeof resourceLabels>;
