import { describe, expect, it } from 'vitest';
import {
  DEFAULT_BRAND,
  contrastRatio,
  deriveBrandScale,
  normalizeHex,
  themeCss,
} from '@/lib/theme';

/**
 * The point of deriving the scale rather than letting an admin pick each stop
 * is that the generated colours cannot fail contrast. These tests hold that
 * promise across the whole hue circle, including the awkward ones — yellow is
 * bright enough that it has to be darkened a long way before white text works.
 */
const HUES = [
  '#e63329', // the shipped red
  '#2563eb', // blue
  '#16a34a', // green
  '#f59e0b', // amber
  '#facc15', // yellow — worst case for white text
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#000000',
  '#ffffff',
];

describe('normalizeHex', () => {
  it('accepts the forms a colour input or a person can produce', () => {
    expect(normalizeHex('#AABBCC')).toBe('#aabbcc');
    expect(normalizeHex('aabbcc')).toBe('#aabbcc');
    expect(normalizeHex('#abc')).toBe('#aabbcc');
    expect(normalizeHex('  #AbC  ')).toBe('#aabbcc');
  });

  it('rejects anything else', () => {
    for (const bad of ['', '#', 'red', '#12345', '#gggggg', 'rgb(1,2,3)', '#1234567']) {
      expect(normalizeHex(bad)).toBeNull();
    }
  });
});

describe('contrastRatio', () => {
  it('matches known WCAG values', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // The shipped brand red against white — the measurement that forced every
    // white-text fill onto `brand-600` in the first place.
    expect(contrastRatio('#e63329', '#ffffff')).toBeCloseTo(4.31, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#123456', '#abcdef')).toBeCloseTo(
      contrastRatio('#abcdef', '#123456'),
      10,
    );
  });
});

describe('deriveBrandScale', () => {
  it.each(HUES)('keeps text-bearing stops readable on white for %s', (hue) => {
    const scale = deriveBrandScale(hue);

    // `600` is both the link colour on white and the button fill under white
    // text; either way the requirement against white is the same.
    expect(contrastRatio(scale[600], '#ffffff')).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(scale[700], '#ffffff')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(HUES)('keeps chips readable: 600 on the 50 tint for %s', (hue) => {
    const scale = deriveBrandScale(hue);
    expect(contrastRatio(scale[600], scale[50])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(HUES)('keeps the dark-mode accent readable on the admin panel for %s', (hue) => {
    const scale = deriveBrandScale(hue);
    expect(contrastRatio(scale.onDark, '#17171b')).toBeGreaterThanOrEqual(4.5);
  });

  it.each(HUES)('orders the scale from light to dark for %s', (hue) => {
    const scale = deriveBrandScale(hue);
    const lum = (value: string) => contrastRatio(value, '#000000');

    // Higher contrast against black means lighter.
    expect(lum(scale[50])).toBeGreaterThan(lum(scale[100]));
    expect(lum(scale[100])).toBeGreaterThan(lum(scale[600]));
    expect(lum(scale[600])).toBeGreaterThan(lum(scale[700]));
  });

  it('gives hover a visible step down from the resting colour', () => {
    for (const hue of HUES) {
      const scale = deriveBrandScale(hue);
      expect(scale[700]).not.toBe(scale[600]);
    }
  });

  it('keeps 500 exactly as chosen — it is decorative and carries no text', () => {
    expect(deriveBrandScale('#2563eb')[500]).toBe('#2563eb');
    expect(deriveBrandScale('#ABC')[500]).toBe('#aabbcc');
  });

  it('returns the hand-tuned palette verbatim for the default red', () => {
    // Adding this feature must not repaint a site whose owner never picked a
    // colour: the shipped stops come back exactly, not regenerated near-misses.
    expect(deriveBrandScale(DEFAULT_BRAND)).toEqual({
      50: '#fff1f0',
      100: '#ffe0dd',
      500: '#e63329',
      600: '#c42a21',
      700: '#9d221b',
      onDark: '#ff7a70',
    });
    expect(deriveBrandScale('#E63329')).toEqual(deriveBrandScale(DEFAULT_BRAND));
  });

  it('falls back to the default for input it cannot parse', () => {
    expect(deriveBrandScale('not a colour')[500]).toBe(DEFAULT_BRAND);
    expect(deriveBrandScale('')[500]).toBe(DEFAULT_BRAND);
  });

  it('is deterministic', () => {
    expect(deriveBrandScale('#2563eb')).toEqual(deriveBrandScale('#2563eb'));
  });
});

describe('themeCss', () => {
  it('emits every brand variable and the dark accent', () => {
    const css = themeCss(deriveBrandScale('#2563eb'));

    for (const stop of ['50', '100', '500', '600', '700']) {
      expect(css).toContain(`--color-brand-${stop}:`);
    }
    expect(css).toContain('--admin-accent:');
    // Doubled selector: this has to beat Tailwind's own `:root` block whatever
    // order the stylesheets land in.
    expect(css.startsWith(':root:root{')).toBe(true);
  });

  it('produces no characters that would need escaping in a style tag', () => {
    const css = themeCss(deriveBrandScale('#e63329'));
    expect(css).not.toMatch(/[<>]/);
  });
});
