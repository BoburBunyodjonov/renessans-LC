import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats a price like `850 000` with narrow no-break spaces. */
export function formatPrice(
  value: number | string | null | undefined,
  locale = 'uz-UZ',
): string | null {
  if (value === null || value === undefined || value === '') return null;
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(numeric)) return null;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
    .format(numeric)
    .replace(/ /g, ' ');
}

/**
 * Deterministic colour derived from a name (testimonial avatars).
 *
 * Lightness is capped at 28%: the badge carries white initials, and at the
 * previous 45% the yellow-green hues landed at 3.8:1 — under the 4.5:1 the
 * small bold text needs. At 65% saturation and 28% lightness the worst hue
 * clears 4.8:1, so every generated colour is accessible.
 */
export function colorFromString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return `hsl(${Math.abs(hash) % 360} 65% 28%)`;
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function absoluteUrl(path = ''): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
