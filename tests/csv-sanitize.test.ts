import { describe, expect, it } from 'vitest';
import { toCsv } from '@/lib/csv';
import { htmlToText, sanitizeHtml, sanitizeLocalizedHtml } from '@/lib/sanitize';
import { colorFromString, formatPrice, initialsOf } from '@/lib/utils';

describe('toCsv', () => {
  it('writes a header row and quotes risky values', () => {
    const csv = toCsv([
      { name: 'Ali', note: 'says "hi", loudly' },
      { name: 'Vali', note: 'line\nbreak' },
    ]);

    expect(csv).toContain('name,note');
    expect(csv).toContain('"says ""hi"", loudly"');
    expect(csv).toContain('"line\nbreak"');
    expect(csv.startsWith('﻿')).toBe(true); // BOM for Excel
  });

  it('returns an empty string for no rows', () => {
    expect(toCsv([])).toBe('');
  });
});

describe('sanitizeHtml', () => {
  it('keeps formatting tags', () => {
    const html = '<h2>Title</h2><p><strong>bold</strong> and <a href="/x">link</a></p>';
    expect(sanitizeHtml(html)).toBe(html);
  });

  it('strips scripts and event handlers', () => {
    expect(sanitizeHtml('<p onclick="steal()">hi</p><script>evil()</script>')).toBe('<p>hi</p>');
  });

  it('strips javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:');
  });

  it('sanitizes every locale of a localized value', () => {
    const result = sanitizeLocalizedHtml({
      uz: '<p>ok</p><script>x()</script>',
      ru: '<img src=x onerror=alert(1)>',
      en: '<p>fine</p>',
    });
    expect(result.uz).toBe('<p>ok</p>');
    expect(result.ru).not.toContain('onerror');
    expect(result.en).toBe('<p>fine</p>');
  });

  it('handles empty input', () => {
    expect(sanitizeHtml(null)).toBe('');
    expect(htmlToText('<p>Hello&nbsp;there</p>')).toBe('Hello there');
  });
});

describe('utils', () => {
  it('formats prices with narrow no-break spaces', () => {
    expect(formatPrice(850000, 'uz-UZ')).toBe('850 000');
    expect(formatPrice(null)).toBeNull();
    expect(formatPrice('not a number')).toBeNull();
  });

  it('derives stable initials and colours', () => {
    expect(initialsOf('Nodira Karimova')).toBe('NK');
    expect(initialsOf('Ali')).toBe('A');
    expect(colorFromString('Ali')).toBe(colorFromString('Ali'));
    expect(colorFromString('Ali')).not.toBe(colorFromString('Vali'));
  });
});
