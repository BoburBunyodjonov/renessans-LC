/**
 * Derives the brand colour scale the site paints with from a single colour
 * chosen in the admin panel.
 *
 * Only one colour is editable on purpose. The five brand stops are not
 * independent: `brand-600` carries white text on buttons *and* is the link
 * colour on white, `brand-50` is the chip background that `brand-600` sits on.
 * Letting someone pick those separately is how a site ends up with unreadable
 * buttons, so the scale is generated here and every stop that carries text is
 * pushed until it clears WCAG AA (PROMPT.md §3).
 *
 * Lightness is adjusted in OKLCH rather than sRGB: equal steps there look
 * equal to the eye, so a blue and a red brand produce scales of the same
 * visual weight.
 */

/** The red the site shipped with; also the reset target in the admin. */
export const DEFAULT_BRAND = '#e63329';

/** Admin panel surface the dark-mode accent has to stay readable against. */
const ADMIN_PANEL_DARK = '#17171b';

/**
 * The palette the site shipped with, hand-tuned rather than generated.
 *
 * Derivation would produce a usable red for this same input, but a slightly
 * different one (5.19:1 on white against this palette's 5.68:1), and this is
 * the design that was measured at 100 accessibility. Returning it verbatim
 * means adding this feature changes nothing for anyone who never picks a
 * colour; generation is reserved for the colours nobody has tuned by hand.
 */
const SHIPPED_SCALE: BrandScale = {
  50: '#fff1f0',
  100: '#ffe0dd',
  500: '#e63329',
  600: '#c42a21',
  700: '#9d221b',
  onDark: '#ff7a70',
};

export type BrandScale = {
  50: string;
  100: string;
  500: string;
  600: string;
  700: string;
  /** Lightened for dark admin surfaces, where `600` is far too dark to read. */
  onDark: string;
};

type Rgb = { r: number; g: number; b: number };
type Oklch = { l: number; c: number; h: number };

/** Accepts `#abc`, `abc`, `#aabbcc`; returns lowercase `#aabbcc` or null. */
export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(value)) {
    return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`;
  }
  return /^[0-9a-f]{6}$/.test(value) ? `#${value}` : null;
}

function hexToRgb(hex: string): Rgb {
  const value = normalizeHex(hex) ?? DEFAULT_BRAND;
  return {
    r: parseInt(value.slice(1, 3), 16) / 255,
    g: parseInt(value.slice(3, 5), 16) / 255,
    b: parseInt(value.slice(5, 7), 16) / 255,
  };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(1, Math.max(0, value)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

const toLinear = (value: number) =>
  value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
const toGamma = (value: number) =>
  value <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** WCAG contrast ratio, 1–21. Order of the arguments does not matter. */
export function contrastRatio(a: string, b: string): number {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// Oklab conversion — Björn Ottosson's matrices.
function rgbToOklch(rgb: Rgb): Oklch {
  const r = toLinear(rgb.r);
  const g = toLinear(rgb.g);
  const b = toLinear(rgb.b);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: lightness,
    c: Math.sqrt(a * a + bb * bb),
    h: Math.atan2(bb, a),
  };
}

function oklchToRgb({ l, c, h }: Oklch): Rgb {
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);

  const lCube = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mCube = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sCube = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: toGamma(4.0767416621 * lCube - 3.3077115913 * mCube + 0.2309699292 * sCube),
    g: toGamma(-1.2684380046 * lCube + 2.6097574011 * mCube - 0.3413193965 * sCube),
    b: toGamma(-0.0041960863 * lCube - 0.7034186147 * mCube + 1.707614701 * sCube),
  };
}

/**
 * Derivation works from a lightness inside this band even when the chosen
 * colour sits outside it. Pure black has no room left to darken, so `600` and
 * `700` would come out identical and hover would stop reading as a change.
 */
const LIGHTNESS_FLOOR = 0.12;
const WORKABLE_MIN = 0.2;
const WORKABLE_MAX = 0.95;

const inGamut = ({ r, g, b }: Rgb) =>
  [r, g, b].every((value) => value >= -0.0001 && value <= 1.0001);

/**
 * Renders an OKLCH colour as sRGB. A lightness change can push a saturated hue
 * outside the display gamut, where naive clamping shifts the hue visibly, so
 * chroma is reduced until the colour fits.
 */
function render(target: Oklch): string {
  if (inGamut(oklchToRgb(target))) return rgbToHex(oklchToRgb(target));

  let low = 0;
  let high = target.c;
  for (let step = 0; step < 20; step += 1) {
    const mid = (low + high) / 2;
    if (inGamut(oklchToRgb({ ...target, c: mid }))) low = mid;
    else high = mid;
  }
  return rgbToHex(oklchToRgb({ ...target, c: low }));
}

/**
 * Darkens `base` until it reaches `minContrast` against `background`.
 *
 * The background matters: `brand-600` is measured against the `brand-50` chip
 * it sits on rather than against white, because that tint is slightly darker
 * and is therefore the harder of the two constraints. Satisfying it satisfies
 * white for free.
 */
function darkenUntilReadable(base: Oklch, background: string, minContrast: number): string {
  let lightness = base.l;
  for (let step = 0; step < 80; step += 1) {
    const candidate = render({ ...base, l: lightness });
    if (contrastRatio(candidate, background) >= minContrast) return candidate;
    lightness -= 0.015;
    if (lightness <= LIGHTNESS_FLOOR) break;
  }
  return render({ ...base, l: LIGHTNESS_FLOOR });
}

/** Mirror of the above for dark surfaces: lighten until readable on the panel. */
function lightenUntilReadable(base: Oklch, minContrast: number): string {
  let lightness = base.l;
  for (let step = 0; step < 60; step += 1) {
    const candidate = render({ ...base, l: lightness });
    if (contrastRatio(candidate, ADMIN_PANEL_DARK) >= minContrast) return candidate;
    lightness += 0.015;
    if (lightness >= 1) break;
  }
  return render({ ...base, l: 0.95 });
}

/**
 * Builds the five brand stops plus the dark-surface accent.
 *
 * `500` is the colour as chosen — it is decorative (focus rings, small
 * accents) and never carries text. `600` and `700` do carry text, so both are
 * darkened until they clear 4.5:1 against the lightest surface they appear on,
 * and `700` is kept a visible step below `600` so hover still reads as a
 * change.
 */
export function deriveBrandScale(input: string): BrandScale {
  const base = normalizeHex(input) ?? DEFAULT_BRAND;
  if (base === DEFAULT_BRAND) return SHIPPED_SCALE;

  const oklch = rgbToOklch(hexToRgb(base));
  const workable: Oklch = {
    ...oklch,
    l: Math.min(WORKABLE_MAX, Math.max(WORKABLE_MIN, oklch.l)),
  };

  // Tints: high lightness, chroma pulled right down so they stay backgrounds.
  const fifty = render({ ...workable, l: 0.97, c: Math.min(workable.c, 0.035) });
  const hundred = render({ ...workable, l: 0.93, c: Math.min(workable.c, 0.06) });

  // Measured against the chip tint, which is the stricter of its two
  // backgrounds — `600` is the chip's text as well as a fill under white text.
  const six = darkenUntilReadable(workable, fifty, 4.5);
  const sixOklch = rgbToOklch(hexToRgb(six));
  const seven = darkenUntilReadable(
    { ...sixOklch, l: Math.max(LIGHTNESS_FLOOR, sixOklch.l - 0.08) },
    fifty,
    4.5,
  );

  return {
    50: fifty,
    100: hundred,
    500: base,
    600: six,
    700: seven,
    onDark: lightenUntilReadable(workable, 4.5),
  };
}

/**
 * The CSS the layouts inject. Tailwind's `@theme` block defines these same
 * variables on `:root`, and this has to win regardless of stylesheet order —
 * hence the doubled selector, which raises specificity without `!important`.
 */
export function themeCss(scale: BrandScale): string {
  return (
    ':root:root{' +
    `--color-brand-50:${scale[50]};` +
    `--color-brand-100:${scale[100]};` +
    `--color-brand-500:${scale[500]};` +
    `--color-brand-600:${scale[600]};` +
    `--color-brand-700:${scale[700]};` +
    '}' +
    // Dark mode is admin-only; the accent there is derived from the same hue.
    `.dark{--admin-accent:${scale.onDark};}`
  );
}
