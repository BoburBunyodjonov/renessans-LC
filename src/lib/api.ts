import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import type { ZodError } from 'zod';

/** Response envelope from PROMPT.md §15. */
export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: { code: string; message: string; fields?: Record<string, string> };
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ ok: true, data }, init);
}

export function fail(
  code: string,
  message: string,
  status: number,
  fields?: Record<string, string>,
) {
  return NextResponse.json<ApiFailure>({ ok: false, error: { code, message, fields } }, { status });
}

/** Flattens a Zod error into `{ field: messageKey }` for the client form. */
export function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

export function validationFailed(error: ZodError) {
  return fail('VALIDATION_ERROR', 'Invalid payload', 422, zodFields(error));
}

export function rateLimited() {
  return fail('RATE_LIMITED', 'Too many requests', 429);
}

/**
 * Route handlers are cross-origin-reachable, so verify `Origin` for mutations
 * (PROMPT.md §17). Same-origin browsers always send it for POST.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true; // non-browser client (curl, server-to-server)

  const allowed = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) allowed.add(new URL(siteUrl).origin);
  allowed.add(new URL(request.url).origin);

  const host = request.headers.get('host');
  if (host) {
    allowed.add(`https://${host}`);
    allowed.add(`http://${host}`);
  }

  return allowed.has(origin);
}

export function requestId(): string {
  return randomUUID().slice(0, 8);
}

export function logError(scope: string, id: string, error: unknown) {
  console.error(`[${scope}][${id}]`, error instanceof Error ? error.stack : error);
}

/** Never echo an internal error back to the client. */
export function serverError(id: string) {
  return fail('INTERNAL_ERROR', `Request ${id} failed`, 500);
}
