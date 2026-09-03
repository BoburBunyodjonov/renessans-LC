import type { Localized } from '../../src/types/i18n';

/** Shorthand for a localized value: L('uz', 'ru', 'en'). */
export const L = (uz: string, ru: string, en: string): Localized => ({ uz, ru, en });

/** Demo imagery. Replace with the school's own assets before launch (PROMPT.md §21). */
export const PHOTO = {
  classroom: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&q=80',
  students: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
  kids: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200&q=80',
  ielts: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
  corporate: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
  online: 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=1200&q=80',
  campus: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=80',
  team: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80',
  award: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&q=80',
} as const;

export const PORTRAIT = (seed: string) =>
  `https://images.unsplash.com/photo-${seed}?w=800&h=1067&fit=crop&q=80`;
