import { z } from 'zod';

/**
 * Uzbek mobile numbers: +998 followed by a 2-digit operator code and 7 digits.
 * Input arrives masked (`+998 (90) 123-45-67`), so punctuation is stripped first.
 */
export const UZ_PHONE_REGEX = /^\+998(9[0-9]|8[78]|3[3]|7[1-9]|6[125-9]|5[05]|2[0-9]|4[0-9])\d{7}$/;

export const normalizePhone = (value: string): string => {
  let digits = value.replace(/\D/g, '');
  // Tolerate a doubled country code from a pasted number in the masked field.
  while (digits.length > 9 && digits.startsWith('998')) digits = digits.slice(3);
  return `+998${digits}`;
};

export const phoneSchema = z
  .string()
  .trim()
  .min(1)
  .transform(normalizePhone)
  .refine((value) => UZ_PHONE_REGEX.test(value), { message: 'invalidPhone' });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'required' })
  .max(80)
  // Strip anything that looks like markup before it ever reaches storage.
  .transform((value) => value.replace(/[<>]/g, ''));

export const optionalEmailSchema = z
  .union([z.string().trim().email({ message: 'invalidEmail' }), z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined));

/** Bots fill hidden fields; humans leave them empty. */
export const honeypotSchema = z
  .string()
  .max(0, { message: 'spam' })
  .optional()
  .or(z.literal(''))
  .transform(() => undefined);

export const utmSchema = z.object({
  utmSource: z.string().trim().max(120).optional(),
  utmMedium: z.string().trim().max(120).optional(),
  utmCampaign: z.string().trim().max(120).optional(),
  utmContent: z.string().trim().max(120).optional(),
  utmTerm: z.string().trim().max(120).optional(),
  referrer: z.string().trim().max(500).optional(),
  page: z.string().trim().max(300).optional(),
});

export const localeSchema = z.enum(['uz', 'ru', 'en']).default('uz');
