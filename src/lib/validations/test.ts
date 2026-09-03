import { z } from 'zod';
import { localeSchema, nameSchema, phoneSchema, utmSchema } from './common';

export const testAnswerSchema = z.object({
  questionId: z.string().cuid(),
  optionId: z.string().cuid(),
});

export const testSubmitSchema = utmSchema.extend({
  answers: z.array(testAnswerSchema).max(200),
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  durationSec: z.number().int().min(0).max(86_400).optional(),
  locale: localeSchema,
});

export type TestSubmitPayload = z.output<typeof testSubmitSchema>;
export type TestAnswerInput = z.infer<typeof testAnswerSchema>;
