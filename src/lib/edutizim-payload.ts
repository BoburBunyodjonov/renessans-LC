/**
 * The shape of an EduTizim order and how one is built from a finished test.
 *
 * Kept apart from the module that actually posts it: that one is `server-only`,
 * which cannot be imported from a test, and this mapping is the part most worth
 * testing. Nothing here touches the network or reads a secret.
 *
 * The receiving `StudentOrderDto` silently drops any field it does not declare,
 * so what is built here is exactly what it accepts — no more, no less.
 */

export type EdutizimConfig = {
  enabled: boolean;
  surveyId: string | null;
  branchId: string | null;
  /** Custom field ids on the student card, created by the school in EduTizim. */
  scoreFieldId: string | null;
  levelFieldId: string | null;
  kindFieldId: string | null;
};

export const EMPTY_CONFIG: EdutizimConfig = {
  enabled: false,
  surveyId: null,
  branchId: null,
  scoreFieldId: null,
  levelFieldId: null,
  kindFieldId: null,
};

/** Reads the stored settings blob without trusting its shape. */
export function toConfig(value: unknown): EdutizimConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return EMPTY_CONFIG;
  const record = value as Record<string, unknown>;
  const text = (key: string) => {
    const item = record[key];
    return typeof item === 'string' && item.trim() ? item.trim() : null;
  };

  return {
    enabled: record.enabled === true,
    surveyId: text('surveyId'),
    branchId: text('branchId'),
    scoreFieldId: text('scoreFieldId'),
    levelFieldId: text('levelFieldId'),
    kindFieldId: text('kindFieldId'),
  };
}

export type OrderInput = {
  name: string;
  phone: string;
  /** From the band the attempt landed on; either may be missing. */
  courseId: string | null;
  subCourseId: string | null;
  /** Free text that becomes a comment on the order. */
  comment: string;
  /** `[fieldId, value]` pairs for the student's custom fields. */
  customFields: [string, string][];
};

/**
 * Splits a display name the way the receiving DTO wants it: a required first
 * name and an optional last name. A single word stays the first name.
 */
export function splitName(full: string): { firstName: string; lastName?: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: parts[0] ?? '—' };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(' ') };
}

/**
 * Builds the request body. Kept separate from the call so the mapping can be
 * unit tested without a network, and so it is obvious which fields travel.
 */
export function buildOrderBody(config: EdutizimConfig, input: OrderInput) {
  const { firstName, lastName } = splitName(input.name);

  const customFields = input.customFields
    .filter(([id, value]) => id && value)
    .map(([id, value]) => ({ _id: id, value }));

  const body: Record<string, unknown> = {
    firstName,
    phoneNumber: input.phone,
    comment: input.comment,
  };

  // Every optional field is omitted rather than sent as null: the receiving
  // validator rejects a null where it expects a Mongo id.
  if (lastName) body.lastName = lastName;
  if (config.surveyId) body.surveyId = config.surveyId;
  if (config.branchId) body.branchId = config.branchId;
  if (input.courseId) body.courseId = input.courseId;
  if (input.subCourseId) body.subCourseId = input.subCourseId;
  if (customFields.length > 0) body.customFields = customFields;

  return body;
}
