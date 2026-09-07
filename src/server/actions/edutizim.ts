'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { toConfig } from '@/lib/edutizim-payload';
import {
  fetchBranches,
  fetchCourses,
  fetchSurvey,
  resolveCredentials,
  type EdutizimBranch,
  type EdutizimCourse,
  type EdutizimSurvey,
} from '@/server/services/edutizim';
import { actionError, requireCapability, type ActionResult } from '@/server/actions/helpers';

/**
 * The lookups behind the EduTizim panel, so a school connects itself.
 *
 * All three take the connection the admin is *currently typing* rather than the
 * saved one, because the whole point is to find out whether it works before
 * committing it. An omitted key means "the one already stored" — the browser is
 * never sent the key, so it cannot send it back.
 *
 * Nothing here is public: each call needs the same capability as saving the
 * settings it feeds.
 */

const draftSchema = z.object({
  baseUrl: z.string().trim().max(200).optional(),
  organization: z.string().trim().max(100).optional(),
  /** Blank means the stored key; the form leaves it blank unless it is retyped. */
  apiKey: z.string().trim().max(200).optional(),
});

export type EdutizimDraft = z.infer<typeof draftSchema>;

/** Reads the saved connection so a draft can fall back to the stored key. */
async function credentialsFor(draft: EdutizimDraft) {
  const settings = await prisma.siteSetting.findUnique({
    where: { id: 'singleton' },
    select: { edutizim: true },
  });
  return resolveCredentials(toConfig(settings?.edutizim), draft);
}

/**
 * Proves the organisation and key belong together, and returns the branches as
 * the evidence — which are also the first thing the panel needs.
 */
export async function testEdutizimConnection(
  input: EdutizimDraft,
): Promise<ActionResult<EdutizimBranch[]>> {
  try {
    await requireCapability('manageSettings');
    const credentials = await credentialsFor(draftSchema.parse(input));
    if (!credentials) return { ok: false, error: 'EDUTIZIM_INCOMPLETE' };

    const result = await fetchBranches(credentials);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, data: result.data };
  } catch (error) {
    return actionError(error);
  }
}

/** Courses and their levels for the branch a band should be filed under. */
export async function listEdutizimCourses(
  input: EdutizimDraft & { branchId?: string | null },
): Promise<ActionResult<EdutizimCourse[]>> {
  try {
    await requireCapability('manageSettings');
    const credentials = await credentialsFor(draftSchema.parse(input));
    if (!credentials) return { ok: false, error: 'EDUTIZIM_INCOMPLETE' };

    const result = await fetchCourses(credentials, input.branchId ?? null);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, data: result.data };
  } catch (error) {
    return actionError(error);
  }
}

/**
 * Turns the survey number printed on the school's own EduTizim page into the id
 * orders are filed under. This is the one field they genuinely have to read off
 * another screen, so it stays a number they recognise rather than an id.
 */
export async function resolveEdutizimSurvey(
  input: EdutizimDraft & { surveyNumber: string },
): Promise<ActionResult<EdutizimSurvey>> {
  try {
    await requireCapability('manageSettings');
    const number = z.string().trim().min(1).max(20).parse(input.surveyNumber);
    const credentials = await credentialsFor(draftSchema.parse(input));
    if (!credentials) return { ok: false, error: 'EDUTIZIM_INCOMPLETE' };

    const result = await fetchSurvey(credentials, number);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true, data: result.data };
  } catch (error) {
    return actionError(error);
  }
}
