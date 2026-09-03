'use server';

import { revalidatePath } from 'next/cache';
import {
  actionError,
  requireCapability,
  revalidate,
  writeAudit,
  type ActionResult,
} from '@/server/actions/helpers';
import {
  delegateFor,
  buildData,
  requiredFieldErrors,
  resourceConfig,
} from '@/server/admin/records';
import type { RecordData } from '@/server/admin/delegates';

/**
 * Generic CRUD for every resource in `config/admin-resources.ts`. Each action
 * checks the capability server-side, writes an audit entry and invalidates the
 * public-site cache tags the resource feeds.
 */

export async function saveRecord(
  resourceKey: string,
  id: string | null,
  values: RecordData,
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireCapability('contentCrud');
    const config = resourceConfig(resourceKey);
    const delegate = delegateFor(resourceKey);
    if (!config || !delegate) return { ok: false, error: 'UNKNOWN_RESOURCE' };

    const fields = requiredFieldErrors(config, values);
    if (Object.keys(fields).length > 0) {
      return { ok: false, error: 'VALIDATION_ERROR', fields };
    }

    const data = buildData(config, values);

    // 1:1 relations (Problem -> Solution) are written as a nested upsert.
    const nestedPayloads: Record<string, RecordData> = {};
    for (const relation of delegate.nested ?? []) {
      if (relation in data) {
        nestedPayloads[relation] = data[relation] as RecordData;
        delete data[relation];
      }
    }

    let recordId = id;

    if (id) {
      for (const [relation, payload] of Object.entries(nestedPayloads)) {
        data[relation] = { upsert: { create: payload, update: payload } };
      }
      await delegate.model.update({ where: { id }, data });
    } else {
      for (const [relation, payload] of Object.entries(nestedPayloads)) {
        data[relation] = { create: payload };
      }
      const created = await delegate.model.create({ data });
      recordId = created.id;
    }

    await writeAudit({
      userId: user.id,
      action: id ? 'UPDATE' : 'CREATE',
      entity: resourceKey,
      entityId: recordId,
      diff: values,
    });
    await revalidate(config.tags);
    revalidatePath('/admin/' + resourceKey);

    return { ok: true, data: { id: recordId! } };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteRecord(resourceKey: string, id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('softDelete');
    const config = resourceConfig(resourceKey);
    const delegate = delegateFor(resourceKey);
    if (!config || !delegate) return { ok: false, error: 'UNKNOWN_RESOURCE' };

    if (delegate.softDelete) {
      await delegate.model.update({ where: { id }, data: { deletedAt: new Date() } });
    } else {
      await delegate.model.delete({ where: { id } });
    }

    await writeAudit({ userId: user.id, action: 'DELETE', entity: resourceKey, entityId: id });
    await revalidate(config.tags);
    revalidatePath('/admin/' + resourceKey);

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function restoreRecord(resourceKey: string, id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('hardDelete');
    const config = resourceConfig(resourceKey);
    const delegate = delegateFor(resourceKey);
    if (!config || !delegate?.softDelete) return { ok: false, error: 'UNKNOWN_RESOURCE' };

    await delegate.model.update({ where: { id }, data: { deletedAt: null } });
    await writeAudit({ userId: user.id, action: 'RESTORE', entity: resourceKey, entityId: id });
    await revalidate(config.tags);
    revalidatePath('/admin/' + resourceKey);

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

/** Persists a new drag-and-drop order in one batch. */
export async function reorderRecords(
  resourceKey: string,
  orderedIds: string[],
): Promise<ActionResult> {
  try {
    const user = await requireCapability('contentCrud');
    const config = resourceConfig(resourceKey);
    const delegate = delegateFor(resourceKey);
    if (!config || !delegate) return { ok: false, error: 'UNKNOWN_RESOURCE' };

    await Promise.all(
      orderedIds.map((id, index) =>
        delegate.model.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );

    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: resourceKey,
      diff: { reorder: orderedIds },
    });
    await revalidate(config.tags);
    revalidatePath('/admin/' + resourceKey);

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

/** Publish / unpublish toggle used from list rows. */
export async function togglePublished(
  resourceKey: string,
  id: string,
  value: boolean,
): Promise<ActionResult> {
  try {
    const user = await requireCapability('publish');
    const config = resourceConfig(resourceKey);
    const delegate = delegateFor(resourceKey);
    if (!config || !delegate || !config.publishField) {
      return { ok: false, error: 'UNKNOWN_RESOURCE' };
    }

    await delegate.model.update({ where: { id }, data: { [config.publishField]: value } });
    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: resourceKey,
      entityId: id,
      diff: { [config.publishField]: value },
    });
    await revalidate(config.tags);
    revalidatePath('/admin/' + resourceKey);

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
