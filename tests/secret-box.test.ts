import { beforeAll, describe, expect, it } from 'vitest';
import { canSeal, maskHint, open, seal } from '@/lib/secret-box';

beforeAll(() => {
  process.env.AUTH_SECRET = 'test-secret-for-sealing-credentials';
});

describe('seal / open', () => {
  it('returns what went in', () => {
    const key = 'dev-renessans-site-8f3c91a7d2e64b05a9c1';
    expect(open(seal(key))).toBe(key);
  });

  it('produces a different ciphertext each time', () => {
    // A fresh IV per seal: two schools with the same key must not be visibly
    // holding the same key.
    expect(seal('same')).not.toBe(seal('same'));
  });

  it('refuses a secret that was tampered with', () => {
    const sealed = seal('original');
    const [version, iv, tag] = sealed.split('.');
    expect(open(`${version}.${iv}.${tag}.${Buffer.from('other').toString('base64url')}`)).toBeNull();
  });

  it('returns null for anything that is not a sealed secret', () => {
    for (const value of ['', 'plain text', 'v2.a.b.c', 'v1.a.b']) {
      expect(open(value)).toBeNull();
    }
  });

  it('opens with the right key only', () => {
    const sealed = seal('secret');
    process.env.AUTH_SECRET = 'a-different-deployment-secret';
    expect(open(sealed)).toBeNull();
    process.env.AUTH_SECRET = 'test-secret-for-sealing-credentials';
    expect(open(sealed)).toBe('secret');
  });

  it('knows when it cannot seal at all', () => {
    expect(canSeal()).toBe(true);
    const secret = process.env.AUTH_SECRET;
    delete process.env.AUTH_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    expect(canSeal()).toBe(false);
    expect(() => seal('x')).toThrow();
    process.env.AUTH_SECRET = secret;
  });
});

describe('maskHint', () => {
  it('shows only the tail, which is enough to recognise a key', () => {
    expect(maskHint('dev-renessans-site-8f3c91a7d2e64b05a9c1')).toBe('••••a9c1');
    expect(maskHint('')).toBe('••••');
  });
});
