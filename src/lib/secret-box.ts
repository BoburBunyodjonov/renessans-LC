import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

/**
 * Symmetric encryption for the handful of third-party credentials the school
 * types into the admin panel.
 *
 * An API key stored as plain text in a settings row is one careless database
 * dump away from being someone else's. It cannot be hashed — we have to send
 * the original to EduTizim — so it is sealed with AES-256-GCM instead, keyed off
 * the deployment's `AUTH_SECRET`. GCM authenticates as well as encrypts, so a
 * row edited by hand fails to open rather than sending nonsense upstream.
 *
 * Rotating `AUTH_SECRET` makes existing secrets unreadable. That is the right
 * trade — it is one field, retyped in the panel — but it is worth knowing.
 */

const VERSION = 'v1';
/** Fixed and app-specific: this is key derivation, not password hashing. */
const SALT = 'renessans-site-secret-box';

function key(): Buffer {
  const secret = process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (!secret) throw new Error('AUTH_SECRET is not set; cannot store secrets');
  return scryptSync(secret, SALT, 32);
}

/** True when sealing is possible at all — the panel says so rather than failing on save. */
export function canSeal(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim());
}

export function seal(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [VERSION, iv, cipher.getAuthTag(), body]
    .map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
    .join('.');
}

/**
 * Returns null rather than throwing: an unreadable secret means the integration
 * is unconfigured, which every caller already handles, and a settings page that
 * crashes is worse than one that asks for the key again.
 */
export function open(sealed: string): string | null {
  try {
    const [version, iv, tag, body] = sealed.split('.');
    if (version !== VERSION || !iv || !tag || !body) return null;

    const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(iv, 'base64url'));
    decipher.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([
      decipher.update(Buffer.from(body, 'base64url')),
      decipher.final(),
    ]).toString('utf8');
  } catch {
    return null;
  }
}

/** What the panel shows in place of a key it will never send to the browser. */
export function maskHint(plain: string): string {
  const tail = plain.trim().slice(-4);
  return tail ? `••••${tail}` : '••••';
}
