'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ADMIN_LOCALE_COOKIE } from '@/i18n/admin';
import { isLocale } from '@/types/i18n';
import { currentUser } from '@/server/actions/helpers';
import { actionError, type ActionResult } from '@/server/actions/helpers';

/** Switches the admin UI language for the signed-in staff member. */
export async function setAdminLocale(locale: string): Promise<ActionResult> {
  try {
    const user = await currentUser();
    if (!user) return { ok: false, error: 'UNAUTHENTICATED' };
    if (!isLocale(locale)) return { ok: false, error: 'VALIDATION_ERROR' };

    (await cookies()).set(ADMIN_LOCALE_COOKIE, locale, {
      path: '/admin',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: false,
    });

    revalidatePath('/admin', 'layout');
    return { ok: true };
  } catch (error) {
    return actionError(error);
  }
}
