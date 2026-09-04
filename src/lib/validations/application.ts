import { z } from 'zod';
import {
  honeypotSchema,
  localeSchema,
  nameSchema,
  optionalEmailSchema,
  phoneSchema,
  recordIdSchema,
} from './common';

export const applicationSchema = z.object({
  vacancyId: recordIdSchema
    .optional()
    .or(z.literal(''))
    .transform((value) => value || undefined),
  fullName: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  birthDate: z
    .string()
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), { message: 'invalidDate' }),
  about: z.string().trim().max(2000).optional(),
  consent: z
    .union([z.literal('true'), z.literal('on'), z.boolean()])
    .refine((value) => value === true || value === 'true' || value === 'on', {
      message: 'consentRequired',
    }),
  locale: localeSchema,
  hp: honeypotSchema,
});

export type ApplicationPayload = z.output<typeof applicationSchema>;
