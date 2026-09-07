import { describe, expect, it } from 'vitest';
import {
  EMPTY_CONFIG,
  buildOrderBody,
  splitName,
  toConfig,
  type EdutizimConfig,
} from '@/lib/edutizim-payload';

const CONFIG: EdutizimConfig = {
  enabled: true,
  baseUrl: 'https://backend.edutizim.uz',
  organization: 'renessans',
  apiKeySealed: null,
  surveyNumber: 's26',
  surveyId: '674817471cd113e973f7eb9a',
  branchId: '6747f9dd9949c8b2044cd3b9',
  scoreFieldId: 'score-field',
  levelFieldId: 'level-field',
  kindFieldId: 'kind-field',
};

const INPUT = {
  name: 'Aziza Rustamova',
  phone: '+998901234567',
  courseId: '674817471cd113e973f7eb9a',
  subCourseId: '67481818bbcc6323a90d36f8',
  comment: 'Sayt testi: 45/45, Upper-Intermediate',
  customFields: [
    ['score-field', '45/45'],
    ['level-field', 'Upper-Intermediate'],
  ] as [string, string][],
};

describe('toConfig', () => {
  it('reads a well-formed blob', () => {
    const config = toConfig({
      enabled: true,
      surveyId: ' abc ',
      branchId: 'def',
      scoreFieldId: 'x',
      levelFieldId: 'y',
      kindFieldId: 'z',
    });

    expect(config.enabled).toBe(true);
    expect(config.surveyId).toBe('abc');
  });

  it('treats anything unexpected as not configured', () => {
    // The column is free-form JSON, so it can hold whatever an older version or
    // a hand-edited row left behind.
    for (const value of [null, undefined, 'text', 42, [], { enabled: 'yes' }]) {
      expect(toConfig(value).enabled).toBe(false);
    }
  });

  it('reads the connection the school typed into the panel', () => {
    const config = toConfig({
      enabled: true,
      baseUrl: 'https://backend.edutizim.uz',
      organization: 'husniddin',
      apiKeySealed: 'v1.a.b.c',
      surveyNumber: 's26',
    });

    expect(config.baseUrl).toBe('https://backend.edutizim.uz');
    expect(config.organization).toBe('husniddin');
    expect(config.apiKeySealed).toBe('v1.a.b.c');
    expect(config.surveyNumber).toBe('s26');
  });

  it('treats blank strings as missing rather than empty ids', () => {
    const config = toConfig({ enabled: true, surveyId: '   ', branchId: '' });
    expect(config.surveyId).toBeNull();
    expect(config.branchId).toBeNull();
  });
});

describe('splitName', () => {
  it('splits a full name into the two fields the DTO wants', () => {
    expect(splitName('Aziza Rustamova')).toEqual({
      firstName: 'Aziza',
      lastName: 'Rustamova',
    });
  });

  it('keeps a single word as the first name, which is the required one', () => {
    expect(splitName('Aziza')).toEqual({ firstName: 'Aziza' });
  });

  it('puts everything after the first word into the last name', () => {
    expect(splitName('Otabek Yo‘ldoshev Alisher o‘g‘li')).toEqual({
      firstName: 'Otabek',
      lastName: 'Yo‘ldoshev Alisher o‘g‘li',
    });
  });

  it('survives whitespace a form can produce', () => {
    expect(splitName('  Aziza   Rustamova  ')).toEqual({
      firstName: 'Aziza',
      lastName: 'Rustamova',
    });
    expect(splitName('   ').firstName).toBe('—');
  });
});

describe('buildOrderBody', () => {
  it('sends the fields the receiving DTO declares', () => {
    const body = buildOrderBody(CONFIG, INPUT);

    expect(body).toEqual({
      firstName: 'Aziza',
      lastName: 'Rustamova',
      phoneNumber: '+998901234567',
      comment: 'Sayt testi: 45/45, Upper-Intermediate',
      surveyId: CONFIG.surveyId,
      branchId: CONFIG.branchId,
      courseId: INPUT.courseId,
      subCourseId: INPUT.subCourseId,
      customFields: [
        { _id: 'score-field', value: '45/45' },
        { _id: 'level-field', value: 'Upper-Intermediate' },
      ],
    });
  });

  it('omits optional ids rather than sending null', () => {
    // The receiving validator checks these are Mongo ids; a null fails the
    // whole request rather than being ignored.
    const body = buildOrderBody(
      { ...EMPTY_CONFIG, enabled: true, surveyId: 'survey-1' },
      { ...INPUT, courseId: null, subCourseId: null, customFields: [] },
    );

    expect(body).not.toHaveProperty('branchId');
    expect(body).not.toHaveProperty('courseId');
    expect(body).not.toHaveProperty('subCourseId');
    expect(body).not.toHaveProperty('customFields');
    expect(body.surveyId).toBe('survey-1');
  });

  it('drops custom fields with no id or no value', () => {
    const body = buildOrderBody(CONFIG, {
      ...INPUT,
      customFields: [
        ['', 'orphan value'],
        ['field-with-no-value', ''],
        ['good', '35/35'],
      ],
    });

    expect(body.customFields).toEqual([{ _id: 'good', value: '35/35' }]);
  });

  it('omits lastName when the visitor gave one word', () => {
    const body = buildOrderBody(CONFIG, { ...INPUT, name: 'Aziza' });

    expect(body.firstName).toBe('Aziza');
    expect(body).not.toHaveProperty('lastName');
  });
});
