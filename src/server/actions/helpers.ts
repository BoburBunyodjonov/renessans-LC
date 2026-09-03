import 'server-only';

import { revalidateTag } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { can, type Capability, type Role } from '@/lib/permissions';
import type { CacheTag } from '@/lib/cache';

/**
 * Shared guards for admin code. This is a plain server module, not a
 * `'use server'` action file: it exports synchronous helpers too, and those are
 * only allowed outside action modules.
 */

export type ActionResult<T = undefined> =
  { ok: true; data?: T } | { ok: false; error: string; fields?: Record<string, string> };

export type SessionUser = { id: string; name: string; email: string; role: Role };

export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    name: session.user.name ?? '',
    email: session.user.email ?? '',
    role: session.user.role,
  };
}

/** Throws when the signed-in user lacks the capability. Every action starts here. */
export async function requireCapability(capability: Capability): Promise<SessionUser> {
  const user = await currentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  if (!can(user.role, capability)) throw new Error('FORBIDDEN');
  return user;
}

export async function writeAudit(input: {
  userId?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'EXPORT' | 'LOGIN';
  entity: string;
  entityId?: string | null;
  diff?: unknown;
}): Promise<void> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  await prisma.auditLog
    .create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        diff: (input.diff ?? undefined) as never,
        ip,
      },
    })
    .catch((error) => console.error('[audit] write failed', error));
}

/** Invalidates the public-site caches touched by a mutation. */
export async function revalidate(tags: CacheTag[]): Promise<void> {
  for (const tag of tags) revalidateTag(tag);
}

export function actionError(error: unknown): ActionResult {
  const message = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
  if (message === 'UNAUTHENTICATED' || message === 'FORBIDDEN') {
    return { ok: false, error: message };
  }
  console.error('[action]', error);
  return { ok: false, error: 'UNKNOWN_ERROR' };
}
