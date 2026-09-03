import { describe, expect, it } from 'vitest';
import { asLocalized, asLocalizedList, t, tList } from '@/types/i18n';
import { loc, locList, locOrNull } from '@/lib/localize';

const full = { uz: 'Salom', ru: 'Привет', en: 'Hello' };

describe('t', () => {
  it('returns the requested locale', () => {
    expect(t(full, 'ru')).toBe('Привет');
  });

  it('falls back to uz when the translation is missing or blank', () => {
    expect(t({ uz: 'Salom', ru: '', en: '   ' }, 'ru')).toBe('Salom');
    expect(t({ uz: 'Salom', ru: '', en: '' }, 'en')).toBe('Salom');
  });

  it('returns an empty string rather than undefined', () => {
    expect(t(null, 'uz')).toBe('');
    expect(t(undefined, 'en')).toBe('');
    expect(t({ uz: '', ru: '', en: '' }, 'uz')).toBe('');
  });

  it('honours a custom fallback locale', () => {
    expect(t({ uz: '', ru: '', en: 'Hello' }, 'ru', 'en')).toBe('Hello');
  });
});

describe('tList', () => {
  it('maps and drops empty entries', () => {
    expect(tList([full, { uz: '', ru: '', en: '' }], 'en')).toEqual(['Hello']);
  });
});

describe('asLocalized', () => {
  it('normalises a partial JSON value', () => {
    expect(asLocalized({ uz: 'A' })).toEqual({ uz: 'A', ru: '', en: '' });
  });

  it('rejects non-objects', () => {
    expect(asLocalized('nope')).toBeNull();
    expect(asLocalized(['a'])).toBeNull();
    expect(asLocalized(null)).toBeNull();
  });

  it('ignores non-string members', () => {
    expect(asLocalized({ uz: 'A', ru: 42, en: null })).toEqual({ uz: 'A', ru: '', en: '' });
  });
});

describe('asLocalizedList', () => {
  it('keeps only object entries', () => {
    expect(asLocalizedList([full, 'x', 5])).toEqual([full]);
    expect(asLocalizedList(null)).toEqual([]);
  });
});

describe('loc helpers', () => {
  it('reads a Json column with a uz fallback', () => {
    expect(loc({ uz: 'Salom', ru: '' }, 'ru')).toBe('Salom');
    expect(locOrNull({ uz: '', ru: '', en: '' }, 'uz')).toBeNull();
    expect(locList([{ uz: 'Bir', ru: '', en: 'One' }], 'ru')).toEqual(['Bir']);
  });
});
