import { describe, expect, it } from 'vitest';
import { formatUzPhone, isCompleteUzPhone, toE164 } from '@/lib/phone';
import { normalizePhone, UZ_PHONE_REGEX } from '@/lib/validations/common';

describe('formatUzPhone', () => {
  it('masks digits progressively', () => {
    expect(formatUzPhone('')).toBe('+998 ');
    expect(formatUzPhone('90')).toBe('+998 (90)');
    expect(formatUzPhone('901')).toBe('+998 (90) 1');
    expect(formatUzPhone('901234567')).toBe('+998 (90) 123-45-67');
  });

  it('accepts input that already carries the country code', () => {
    expect(formatUzPhone('998901234567')).toBe('+998 (90) 123-45-67');
  });

  it('recovers from a doubled country code', () => {
    // The field pre-fills "+998 ", so pasting a full number used to produce this.
    expect(formatUzPhone('+998 +998 (90) 123-45-67')).toBe('+998 (90) 123-45-67');
    expect(toE164('+998 +998901234567')).toBe('+998901234567');
  });

  it('drops anything beyond nine local digits', () => {
    expect(formatUzPhone('9012345678999')).toBe('+998 (90) 123-45-67');
  });
});

describe('isCompleteUzPhone', () => {
  it('is true only for a full local part', () => {
    expect(isCompleteUzPhone('+998 (90) 123-45-6')).toBe(false);
    expect(isCompleteUzPhone('+998 (90) 123-45-67')).toBe(true);
  });
});

describe('normalizePhone + UZ_PHONE_REGEX', () => {
  it.each([
    ['+998 (90) 123-45-67', '+998901234567'],
    ['998 93 444 55 66', '+998934445566'],
    ['971234567', '+998971234567'],
  ])('normalises %s to %s', (input, expected) => {
    const normalised = normalizePhone(input);
    expect(normalised).toBe(expected);
    expect(UZ_PHONE_REGEX.test(normalised)).toBe(true);
  });

  it('rejects non-Uzbek and incomplete numbers', () => {
    expect(UZ_PHONE_REGEX.test(normalizePhone('+1 555 000 1234'))).toBe(false);
    expect(UZ_PHONE_REGEX.test(normalizePhone('12345'))).toBe(false);
  });
});
