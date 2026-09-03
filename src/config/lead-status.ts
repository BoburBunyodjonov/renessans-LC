export const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'TRIAL_BOOKED',
  'ENROLLED',
  'REJECTED',
  'SPAM',
] as const;

export type LeadStatusKey = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatusKey, string> = {
  NEW: 'Yangi',
  CONTACTED: 'Bog‘lanildi',
  TRIAL_BOOKED: 'Sinov darsiga yozildi',
  ENROLLED: 'O‘qishga yozildi',
  REJECTED: 'Rad etildi',
  SPAM: 'Spam',
};

export const LEAD_STATUS_TONE: Record<
  string,
  'neutral' | 'brand' | 'success' | 'warning' | 'danger'
> = {
  NEW: 'brand',
  CONTACTED: 'warning',
  TRIAL_BOOKED: 'warning',
  ENROLLED: 'success',
  REJECTED: 'neutral',
  SPAM: 'danger',
};

export const APPLICATION_STATUSES = ['NEW', 'REVIEWING', 'INTERVIEW', 'HIRED', 'REJECTED'] as const;
export type ApplicationStatusKey = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatusKey, string> = {
  NEW: 'Yangi',
  REVIEWING: 'Ko‘rib chiqilmoqda',
  INTERVIEW: 'Suhbat',
  HIRED: 'Ishga olindi',
  REJECTED: 'Rad etildi',
};

export const LEAD_SOURCE_LABELS: Record<string, string> = {
  HERO: 'Hero',
  COURSE_CARD: 'Kurs kartasi',
  COURSE_PAGE: 'Kurs sahifasi',
  TEST_RESULT: 'Test natijasi',
  MATERIAL_GATE: 'Material',
  CONTACT_FORM: 'Aloqa formasi',
  FLOATING_CTA: 'Suzuvchi tugma',
  PROMOTION: 'Aksiya',
  OTHER: 'Boshqa',
};
