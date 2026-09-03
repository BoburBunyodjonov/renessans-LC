import DOMPurify from 'isomorphic-dompurify';

/** Tags and attributes the admin editor is allowed to persist (PROMPT.md §15). */
const CONFIG = {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    's',
    'h2',
    'h3',
    'h4',
    'ul',
    'ol',
    'li',
    'blockquote',
    'a',
    'code',
    'pre',
    'mark',
    'span',
  ],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/)/i,
};

export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return '';
  return DOMPurify.sanitize(input, CONFIG);
}

/** Sanitizes each locale of a localized rich-text value. */
export function sanitizeLocalizedHtml<T extends Record<string, string>>(value: T): T {
  const out: Record<string, string> = {};
  for (const [locale, html] of Object.entries(value)) out[locale] = sanitizeHtml(html);
  return out as T;
}

/** Plain-text length of HTML, used for reading-time estimates. */
export function htmlToText(input: string): string {
  return input
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
