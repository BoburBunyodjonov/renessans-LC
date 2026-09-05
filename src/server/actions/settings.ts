'use server';

import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sanitizeLocalizedHtml } from '@/lib/sanitize';
import { normalizeHex } from '@/lib/theme';
import {
  actionError,
  requireCapability,
  revalidate,
  writeAudit,
  type ActionResult,
} from '@/server/actions/helpers';
import { ROLES } from '@/lib/permissions';

const localized = z.object({ uz: z.string(), ru: z.string(), en: z.string() });

const settingsSchema = z.object({
  brandName: localized,
  tagline: localized,
  primaryCtaLabel: localized,
  primaryCtaHref: z.string().max(200).nullable().optional(),
  externalLmsLabel: z.string().max(60).nullable().optional(),
  externalLmsUrl: z.string().max(300).nullable().optional(),
  phones: z.array(z.string().max(40)),
  email: z.string().max(120).nullable().optional(),
  socials: z.record(z.string(), z.string().max(300)),
  tickerItems: z.array(localized),
  currency: z.string().max(10),
  ga4Id: z.string().max(40).nullable().optional(),
  metaPixelId: z.string().max(40).nullable().optional(),
  yandexMetricaId: z.string().max(40).nullable().optional(),
  telegramChatIds: z.record(z.string(), z.string().max(60)),
  privacyPolicy: localized,
  madeByLabel: localized,
  madeByUrl: z.string().max(300).nullable().optional(),
  logoLightUrl: z.string().max(300).nullable().optional(),
  ogImageUrl: z.string().max(300).nullable().optional(),
  // Stored as `#rrggbb`; the rest of the palette is derived from it at render
  // time, so nothing here can produce an unreadable button.
  brandColor: z
    .string()
    .max(9)
    .nullable()
    .optional()
    .refine((value) => !value || normalizeHex(value) !== null, {
      message: 'Not a hex colour',
    }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;

export async function saveSettings(input: SettingsInput): Promise<ActionResult> {
  try {
    const user = await requireCapability('manageSettings');
    const parsed = settingsSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: 'VALIDATION_ERROR' };

    const value = parsed.data;
    const data = {
      brandName: value.brandName,
      tagline: value.tagline,
      primaryCtaLabel: value.primaryCtaLabel,
      primaryCtaHref: value.primaryCtaHref || null,
      externalLmsLabel: value.externalLmsLabel || null,
      externalLmsUrl: value.externalLmsUrl || null,
      phones: value.phones.filter(Boolean),
      email: value.email || null,
      socials: Object.fromEntries(Object.entries(value.socials).filter(([, url]) => url.trim())),
      tickerItems: value.tickerItems,
      currency: value.currency || 'UZS',
      ga4Id: value.ga4Id || null,
      metaPixelId: value.metaPixelId || null,
      yandexMetricaId: value.yandexMetricaId || null,
      telegramChatIds: Object.fromEntries(
        Object.entries(value.telegramChatIds).filter(([, id]) => id.trim()),
      ),
      privacyPolicy: sanitizeLocalizedHtml(value.privacyPolicy),
      madeByLabel: value.madeByLabel,
      madeByUrl: value.madeByUrl || null,
      logoLightUrl: value.logoLightUrl || null,
      ogImageUrl: value.ogImageUrl || null,
      // Null means "the shipped default", which is how the reset button works.
      brandColor: value.brandColor ? normalizeHex(value.brandColor) : null,
    } satisfies Prisma.SiteSettingUncheckedUpdateInput;

    await prisma.siteSetting.upsert({
      where: { id: 'singleton' },
      create: { id: 'singleton', ...data } as Prisma.SiteSettingUncheckedCreateInput,
      update: data,
    });

    await writeAudit({
      userId: user.id,
      action: 'UPDATE',
      entity: 'SiteSetting',
      entityId: 'singleton',
    });
    await revalidate(['settings', 'nav', 'home']);
    revalidatePath('/admin/settings');
    // The palette is injected by the root layouts, so a colour change has to
    // drop every cached page rather than just the ones settings usually touch.
    revalidatePath('/', 'layout');

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

const userSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  role: z.enum(ROLES),
  isActive: z.boolean(),
  password: z.string().min(8).max(200).optional().or(z.literal('')),
});

export async function saveUser(
  id: string | null,
  input: z.input<typeof userSchema>,
): Promise<ActionResult<{ id: string }>> {
  try {
    const actor = await requireCapability('manageUsers');
    const parsed = userSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: 'VALIDATION_ERROR', fields: { form: 'Maydonlarni tekshiring' } };
    }

    const { name, email, role, isActive, password } = parsed.data;

    if (!id && !password) {
      return { ok: false, error: 'VALIDATION_ERROR', fields: { password: 'Parol majburiy' } };
    }

    const passwordHash = password ? await bcrypt.hash(password, 12) : undefined;

    const saved = id
      ? await prisma.user.update({
          where: { id },
          data: { name, email, role, isActive, ...(passwordHash ? { passwordHash } : {}) },
          select: { id: true },
        })
      : await prisma.user.create({
          data: { name, email, role, isActive, passwordHash: passwordHash! },
          select: { id: true },
        });

    await writeAudit({
      userId: actor.id,
      action: id ? 'UPDATE' : 'CREATE',
      entity: 'User',
      entityId: saved.id,
      diff: { name, email, role, isActive, passwordChanged: Boolean(passwordHash) },
    });
    revalidatePath('/admin/users');

    return { ok: true, data: saved };
  } catch (error) {
    return actionError(error);
  }
}

export async function deactivateUser(id: string): Promise<ActionResult> {
  try {
    const actor = await requireCapability('manageUsers');
    if (actor.id === id) return { ok: false, error: 'SELF_DEACTIVATION' };

    await prisma.user.update({ where: { id }, data: { isActive: false } });
    await writeAudit({
      userId: actor.id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
      diff: { isActive: false },
    });
    revalidatePath('/admin/users');

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}

export async function deleteMediaAsset(id: string): Promise<ActionResult> {
  try {
    const user = await requireCapability('contentCrud');
    const asset = await prisma.mediaAsset.findUnique({ where: { id }, select: { key: true } });
    if (!asset) return { ok: false, error: 'NOT_FOUND' };

    const { deleteObject } = await import('@/lib/storage');
    await deleteObject(asset.key);
    await prisma.mediaAsset.delete({ where: { id } });

    await writeAudit({ userId: user.id, action: 'DELETE', entity: 'MediaAsset', entityId: id });
    revalidatePath('/admin/media');

    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
