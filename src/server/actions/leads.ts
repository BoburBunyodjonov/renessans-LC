'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  actionError,
  requireCapability,
  writeAudit,
  type ActionResult,
} from '@/server/actions/helpers';
import { LEAD_STATUSES } from '@/config/lead-status';

function isLeadStatus(value: string): boolean {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export async function updateLeadStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageLeads');
    if (!isLeadStatus(status)) return { ok: false, error: 'VALIDATION_ERROR' };

    await prisma.lead.update({
      where: { id },
      data: { status: status as never },
    });
    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Lead',
      entityId: id,
      diff: { status },
    });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function assignLead(id: string, assigneeId: string | null): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageLeads');
    await prisma.lead.update({ where: { id }, data: { assignedToId: assigneeId } });
    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Lead',
      entityId: id,
      diff: { assignedToId: assigneeId },
    });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function addLeadNote(id: string, body: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageLeads');
    const text = body.trim().slice(0, 2000);
    if (!text) return { ok: false, error: 'VALIDATION_ERROR' };

    await prisma.leadNote.create({ data: { leadId: id, authorId: user.id, body: text } });
    revalidatePath(`/admin/leads/${id}`);
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

/** Bulk status change / assignment from the list view. */
export async function bulkUpdateLeads(
  ids: string[],
  data: { status?: string; assigneeId?: string | null },
): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageLeads');
    if (ids.length === 0) return { ok: true };
    if (data.status && !isLeadStatus(data.status)) return { ok: false, error: 'VALIDATION_ERROR' };

    await prisma.lead.updateMany({
      where: { id: { in: ids } },
      data: {
        ...(data.status ? { status: data.status as never } : {}),
        ...(data.assigneeId !== undefined ? { assignedToId: data.assigneeId } : {}),
      },
    });

    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: 'Lead',
      diff: { ids, ...data },
    });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteLead(id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('softDelete');
    await prisma.lead.update({ where: { id }, data: { deletedAt: new Date() } });
    await writeAudit({ userId: user.id, action: 'DELETE', entity: 'Lead', entityId: id });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

/** Irreversible: used for GDPR-style erasure requests (PROMPT.md §17). */
export async function purgeLead(id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('hardDelete');
    await prisma.lead.delete({ where: { id } });
    await writeAudit({
      userId: user.id,
      action: 'DELETE',
      entity: 'Lead',
      entityId: id,
      diff: { hard: true },
    });
    revalidatePath('/admin/leads');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageLeads');
    const allowed = ['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED', 'REJECTED'];
    if (!allowed.includes(status)) return { ok: false, error: 'VALIDATION_ERROR' };

    await prisma.jobApplication.update({ where: { id }, data: { status: status as never } });
    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: 'JobApplication',
      entityId: id,
      diff: { status },
    });
    revalidatePath('/admin/applications');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function saveApplicationNote(id: string, note: string): Promise<ActionResult> {
  try {
    await requireCapability('manageLeads');
    await prisma.jobApplication.update({
      where: { id },
      data: { note: note.trim().slice(0, 2000) },
    });
    revalidatePath('/admin/applications');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function markMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  try {
    await requireCapability('manageLeads');
    await prisma.contactMessage.update({ where: { id }, data: { isRead } });
    revalidatePath('/admin/messages');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
