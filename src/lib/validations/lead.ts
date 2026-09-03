import { z } from 'zod';
import {
  honeypotSchema,
  localeSchema,
  nameSchema,
  optionalEmailSchema,
  phoneSchema,
  utmSchema,
} from './common';

export const LEAD_SOURCES = [
  'HERO',
  'COURSE_CARD',
  'COURSE_PAGE',
  'TEST_RESULT',
  'MATERIAL_GATE',
  'CONTACT_FORM',
  'FLOATING_CTA',
  'PROMOTION',
  'OTHER',
] as const;

export const leadSchema = utmSchema.extend({
  name: nameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  courseId: z
    .string()
    .cuid()
    .optional()
    .or(z.literal(''))
    .transform((v) => v || undefined),
  message: z.string().trim().max(1000).optional(),
  preferredTime: z.string().trim().max(80).optional(),
  source: z.enum(LEAD_SOURCES).default('OTHER'),
  locale: localeSchema,
  hp: honeypotSchema,
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadPayload = z.output<typeof leadSchema>;

export const contactSchema = utmSchema.extend({
  name: nameSchema,
  phone: phoneSchema.optional(),
  email: optionalEmailSchema,
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(5, { message: 'required' }).max(2000),
  locale: localeSchema,
  hp: honeypotSchema,
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactPayload = z.output<typeof contactSchema>;
