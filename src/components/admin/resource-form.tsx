'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { AdminFormShell } from '@/components/admin/form-shell';
import { Panel } from '@/components/admin/ui';
import { ResourceField } from '@/components/admin/resource-field';
import { deleteRecord, saveRecord } from '@/server/actions/content';
import type { ResourceConfig } from '@/config/admin-resources';

type Values = Record<string, unknown>;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Generic create/edit form driven by a resource config. */
export function ResourceForm({
  config,
  id,
  initial,
  relationOptions,
  previewHref,
  canDelete,
}: {
  config: ResourceConfig;
  id: string | null;
  initial: Values;
  relationOptions: Record<string, { value: string; label: string }[]>;
  previewHref?: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);

  const baseline = useMemo(() => JSON.stringify(initial), [initial]);

  function update(name: string, next: unknown) {
    setValues((current) => {
      const [head, tail] = name.split('.') as [string, string | undefined];
      const updated: Values = tail
        ? { ...current, [head]: { ...((current[head] as Values) ?? {}), [tail]: next } }
        : { ...current, [head]: next };

      // Auto-fill an empty slug from its source field.
      const slugField = config.fields.find((field) => field.kind === 'slug');
      if (
        slugField &&
        slugField.kind === 'slug' &&
        slugField.from === name &&
        !current[slugField.name]
      ) {
        const source = next as { uz?: string } | string;
        const text = typeof source === 'string' ? source : (source?.uz ?? '');
        updated[slugField.name] = slugify(text);
      }

      setDirty(JSON.stringify(updated) !== baseline);
      return updated;
    });
  }

  async function onSave() {
    setErrors({});
    const result = await saveRecord(config.key, id, values);

    if (!result.ok && result.fields) {
      setErrors(result.fields);
      toast.error('Maydonlarni tekshiring');
      return result;
    }

    if (result.ok) {
      setDirty(false);
      if (!id && result.data?.id) {
        router.replace(`/admin/${config.key}/${result.data.id}`);
      }
    }

    return result;
  }

  return (
    <AdminFormShell
      dirty={dirty}
      onSave={onSave}
      onDelete={id && canDelete ? () => deleteRecord(config.key, id) : undefined}
      backHref={`/admin/${config.key}`}
      previewHref={previewHref}
    >
      <Panel className="flex flex-col gap-5">
        {config.fields.map((field) => (
          <ResourceField
            key={field.name}
            field={field}
            error={errors[field.name]}
            relationOptions={
              field.kind === 'relation' ? (relationOptions[field.source] ?? []) : undefined
            }
            value={
              field.name.includes('.')
                ? ((values[field.name.split('.')[0]!] as Values | undefined) ?? {})[
                    field.name.split('.')[1]!
                  ]
                : values[field.name]
            }
            onChange={(next) => update(field.name, next)}
          />
        ))}
      </Panel>
    </AdminFormShell>
  );
}
