import { describe, expect, it } from 'vitest';
import { contactSchema, leadSchema } from '@/lib/validations/lead';
import { testAnswerSchema, testSubmitSchema } from '@/lib/validations/test';
import { applicationSchema } from '@/lib/validations/application';

const validLead = {
  name: 'Nodira Karimova',
  phone: '+998 (90) 123-45-67',
  source: 'HERO' as const,
  locale: 'uz' as const,
};

describe('leadSchema', () => {
  it('accepts a valid lead and normalises the phone', () => {
    const result = leadSchema.safeParse(validLead);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe('+998901234567');
  });

  it('rejects a non-Uzbek phone with the invalidPhone key', () => {
    const result = leadSchema.safeParse({ ...validLead, phone: '+1 555 000 1234' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'invalidPhone')).toBe(true);
    }
  });

  it('rejects a name that is too short', () => {
    const result = leadSchema.safeParse({ ...validLead, name: 'A' });
    expect(result.success).toBe(false);
  });

  it('strips angle brackets from the name', () => {
    const result = leadSchema.safeParse({ ...validLead, name: '<script>alert(1)</script>Ali' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).not.toMatch(/[<>]/);
  });

  it('flags a filled honeypot as spam', () => {
    const result = leadSchema.safeParse({ ...validLead, hp: 'i am a bot' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'spam')).toBe(true);
    }
  });

  it('defaults source and locale', () => {
    const result = leadSchema.safeParse({ name: 'Ali Valiyev', phone: '901234567' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.source).toBe('OTHER');
      expect(result.data.locale).toBe('uz');
    }
  });

  it('drops an empty courseId instead of failing', () => {
    const result = leadSchema.safeParse({ ...validLead, courseId: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.courseId).toBeUndefined();
  });
});

describe('contactSchema', () => {
  it('requires a message of a few characters', () => {
    expect(contactSchema.safeParse({ name: 'Ali Valiyev', message: 'hi' }).success).toBe(false);
    expect(
      contactSchema.safeParse({ name: 'Ali Valiyev', message: 'Salom, savolim bor' }).success,
    ).toBe(true);
  });
});

describe('testSubmitSchema', () => {
  it('accepts answers without contact details', () => {
    const result = testSubmitSchema.safeParse({ answers: [], locale: 'en' });
    expect(result.success).toBe(true);
  });

  it('rejects a malformed answer id', () => {
    // Ids are opaque strings, so the shape is what is checked — not the
    // generator. Whether the id exists is settled by the lookup that follows.
    const result = testSubmitSchema.safeParse({
      answers: [{ questionId: 'not a valid id', optionId: '' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('applicationSchema', () => {
  const base = {
    fullName: 'Playwright Nomzod',
    phone: '+998 (98) 222-33-44',
    consent: 'true' as const,
    locale: 'uz' as const,
  };

  it('requires consent', () => {
    expect(applicationSchema.safeParse({ ...base, consent: '' }).success).toBe(false);
    expect(applicationSchema.safeParse(base).success).toBe(true);
  });

  it('parses an optional birth date', () => {
    const result = applicationSchema.safeParse({ ...base, birthDate: '1999-05-20' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.birthDate?.getFullYear()).toBe(1999);
  });
});

describe('record ids', () => {
  it('accepts both generated cuids and deterministic seeded ids', () => {
    const answers = [
      { questionId: 'cmtkgzr0n003k9khk2mg1v6wy', optionId: 'cmtkgzr0n003k9khk2mg1v6wz' },
      { questionId: 'level-general-q1', optionId: 'level-general-q1-o2' },
    ];

    for (const answer of answers) {
      expect(testAnswerSchema.safeParse(answer).success).toBe(true);
    }
  });

  it('still rejects ids that are empty, oversized or oddly shaped', () => {
    const bad = ['', 'a'.repeat(65), 'has space', "drop';--", '../etc/passwd'];

    for (const id of bad) {
      expect(
        testAnswerSchema.safeParse({ questionId: id, optionId: 'level-general-q1-o2' }).success,
      ).toBe(false);
    }
  });
});
