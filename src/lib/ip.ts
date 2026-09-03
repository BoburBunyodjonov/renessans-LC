import { createHash } from 'node:crypto';
import type { NextRequest } from 'next/server';

/** Best-effort client IP from the usual proxy headers. */
export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers;
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return headers.get('x-real-ip')?.trim() || headers.get('cf-connecting-ip')?.trim() || '0.0.0.0';
}

/** Only ever store `sha256(ip + IP_SALT)` (PROMPT.md §17). */
export function hashIp(ip: string): string {
  const salt = process.env.IP_SALT ?? '';
  return createHash('sha256').update(`${ip}${salt}`).digest('hex');
}
