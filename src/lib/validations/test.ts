import { z } from 'zod';
import { localeSchema, nameSchema, phoneSchema, recordIdSchema, utmSchema } from './common';

/**
 * A CHOICE question is answered with an option id, a TEXT one with what the
 * visitor typed. Which of the two is required depends on the question, so both
 * are optional here and the answer key decides — an answer carrying neither
 * simply grades as wrong.
 */
export const testAnswerSchema = z.object({
  questionId: recordIdSchema,
  optionId: recordIdSchema.optional(),
  text: z.string().max(400).optional(),
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
