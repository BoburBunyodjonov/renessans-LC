import type { CacheTag } from '@/lib/cache';

/**
 * Registry driving the generic admin CRUD pages (`/admin/[resource]`).
 * Resources with bespoke needs (courses, teachers, leads, tests, settings …)
 * have their own routes and are not listed here.
 */

export type FieldSpec =
  | { kind: 'localized'; name: string; label: string; required?: boolean; hint?: string }
  | {
      kind: 'localizedText';
      name: string;
      label: string;
      rows?: number;
      hint?: string;
      required?: boolean;
    }
  | { kind: 'localizedHtml'; name: string; label: string; hint?: string; required?: boolean }
  | { kind: 'localizedList'; name: string; label: string; hint?: string }
  | {
      kind: 'text';
      name: string;
      label: string;
      required?: boolean;
      hint?: string;
      placeholder?: string;
    }
  | { kind: 'slug'; name: string; label: string; from?: string; hint?: string }
  | { kind: 'number'; name: string; label: string; hint?: string }
  | { kind: 'decimal'; name: string; label: string; hint?: string }
  | { kind: 'boolean'; name: string; label: string; hint?: string }
  | { kind: 'image'; name: string; label: string; folder?: string; hint?: string }
  | { kind: 'icon'; name: string; label: string; hint?: string }
  | { kind: 'stringList'; name: string; label: string; hint?: string }
  | { kind: 'date'; name: string; label: string; hint?: string }
  | { kind: 'select'; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: 'relation'; name: string; label: string; source: RelationSource; hint?: string }
  | { kind: 'multiRelation'; name: string; label: string; source: RelationSource; hint?: string }
  | { kind: 'curriculum'; name: string; label: string; hint?: string };

export type RelationSource = 'materialGroups' | 'faqCategories' | 'courses' | 'teachers';

export type ColumnSpec = {
  name: string;
  label: string;
  kind?: 'localized' | 'text' | 'boolean' | 'number' | 'date' | 'image' | 'badge';
};

export type ResourceConfig = {
  /** URL segment and registry key. */
  key: string;
  title: string;
  singular: string;
  description?: string;
  tags: CacheTag[];
  /** Field used for the list search. */
  searchField?: { name: string; localized?: boolean };
  ordered?: boolean;
  publishField?: 'isPublished' | 'isVisible' | 'isActive' | 'isOpen';
  columns: ColumnSpec[];
  fields: FieldSpec[];
  defaultSort?: { id: string; desc: boolean };
};

const LEVEL_OPTIONS = [
  'BEGINNER',
  'ELEMENTARY',
  'PRE_INTERMEDIATE',
  'INTERMEDIATE',
  'UPPER_INTERMEDIATE',
  'ADVANCED',
  'IELTS',
  'KIDS',
].map((value) => ({ value, label: value.replace(/_/g, '-') }));

const MATERIAL_TYPE_OPTIONS = ['PDF', 'AUDIO', 'VIDEO', 'PHOTO'].map((value) => ({
  value,
  label: value,
}));

const SKILL_OPTIONS = ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRANT'].map((value) => ({
  value,
  label: value,
}));

export const ADMIN_RESOURCES: ResourceConfig[] = [
  {
    key: 'hero',
    title: 'Hero slaydlar',
    singular: 'Slayd',
    description: 'Bosh sahifadagi katta banner. Bir nechta slayd bo‘lsa avtomatik almashadi.',
    tags: ['home'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'headline', localized: true },
    columns: [
      { name: 'headline', label: 'Sarlavha', kind: 'localized' },
      { name: 'imageUrl', label: 'Rasm', kind: 'image' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      {
        kind: 'localized',
        name: 'headline',
        label: 'Sarlavha',
        required: true,
        hint: '<mark>so‘z</mark> — ajratib ko‘rsatish uchun',
      },
      { kind: 'localizedText', name: 'subtitle', label: 'Qo‘shimcha matn', rows: 3 },
      { kind: 'localized', name: 'ctaLabel', label: 'Tugma matni' },
      {
        kind: 'text',
        name: 'ctaHref',
        label: 'Tugma havolasi',
        placeholder: '#lead yoki /courses/ielts',
      },
      { kind: 'image', name: 'imageUrl', label: 'Rasm', folder: 'hero' },
      { kind: 'localized', name: 'imageAlt', label: 'Rasm alt matni' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'home-sections',
    title: 'Bosh sahifa bloklari',
    singular: 'Blok',
    description: 'Bloklarni sudrab tartibini o‘zgartiring yoki o‘chirib qo‘ying.',
    tags: ['home'],
    ordered: true,
    publishField: 'isVisible',
    searchField: { name: 'key' },
    columns: [
      { name: 'key', label: 'Kalit', kind: 'text' },
      { name: 'title', label: 'Sarlavha', kind: 'localized' },
      { name: 'isVisible', label: 'Ko‘rinadi', kind: 'boolean' },
    ],
    fields: [
      {
        kind: 'text',
        name: 'key',
        label: 'Kalit',
        required: true,
        hint: 'hero, about, courses … — kod bilan bog‘langan, o‘zgartirmang',
      },
      { kind: 'localized', name: 'eyebrow', label: 'Kichik sarlavha' },
      { kind: 'localized', name: 'title', label: 'Sarlavha' },
      { kind: 'localizedText', name: 'subtitle', label: 'Tavsif', rows: 2 },
      { kind: 'localizedHtml', name: 'body', label: 'Matn (About bloki uchun)' },
      { kind: 'image', name: 'imageUrl', label: 'Rasm', folder: 'sections' },
      { kind: 'text', name: 'videoUrl', label: 'Video havolasi (YouTube)' },
      { kind: 'localized', name: 'ctaLabel', label: 'Tugma matni' },
      { kind: 'text', name: 'ctaHref', label: 'Tugma havolasi' },
      { kind: 'boolean', name: 'isVisible', label: 'Ko‘rinadi' },
    ],
  },
  {
    key: 'stats',
    title: 'Statistika raqamlari',
    singular: 'Raqam',
    tags: ['home'],
    ordered: true,
    publishField: 'isVisible',
    searchField: { name: 'value' },
    columns: [
      { name: 'value', label: 'Qiymat', kind: 'text' },
      { name: 'label', label: 'Izoh', kind: 'localized' },
      { name: 'isVisible', label: 'Ko‘rinadi', kind: 'boolean' },
    ],
    fields: [
      { kind: 'text', name: 'value', label: 'Qiymat', required: true, placeholder: '2 500+' },
      { kind: 'localized', name: 'label', label: 'Izoh', required: true },
      { kind: 'icon', name: 'icon', label: 'Ikonka' },
      { kind: 'boolean', name: 'isVisible', label: 'Ko‘rinadi' },
    ],
  },
  {
    key: 'advantages',
    title: 'Afzalliklar',
    singular: 'Afzallik',
    tags: ['home'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Sarlavha', kind: 'localized' },
      { name: 'icon', label: 'Ikonka', kind: 'text' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Sarlavha', required: true },
      { kind: 'localizedText', name: 'description', label: 'Tavsif', required: true },
      { kind: 'icon', name: 'icon', label: 'Ikonka' },
      { kind: 'image', name: 'imageUrl', label: 'Rasm', folder: 'advantages' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'testimonials',
    title: 'Mijozlar fikri',
    singular: 'Fikr',
    tags: ['testimonials'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'authorName' },
    columns: [
      { name: 'authorName', label: 'Muallif', kind: 'text' },
      { name: 'rating', label: 'Baho', kind: 'number' },
      { name: 'isFeatured', label: 'Tanlangan', kind: 'boolean' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'text', name: 'authorName', label: 'Muallif ismi', required: true },
      { kind: 'localized', name: 'authorRole', label: 'Kim (Ota-ona / O‘quvchi)' },
      { kind: 'localizedText', name: 'content', label: 'Fikr matni', required: true, rows: 5 },
      { kind: 'number', name: 'rating', label: 'Baho (1–5)' },
      { kind: 'image', name: 'avatarUrl', label: 'Avatar', folder: 'testimonials' },
      { kind: 'text', name: 'videoUrl', label: 'Video havolasi (YouTube)' },
      { kind: 'text', name: 'sourceLabel', label: 'Manba (Instagram / Telegram / Google)' },
      { kind: 'text', name: 'sourceUrl', label: 'Manba havolasi' },
      { kind: 'boolean', name: 'isFeatured', label: 'Yuqorida ko‘rsatilsin' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'success-stories',
    title: 'IELTS natijalari',
    singular: 'Natija',
    tags: ['teachers'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'studentName' },
    columns: [
      { name: 'studentName', label: 'O‘quvchi', kind: 'text' },
      { name: 'overallBand', label: 'Overall', kind: 'text' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'text', name: 'studentName', label: 'O‘quvchi ismi', required: true },
      {
        kind: 'text',
        name: 'overallBand',
        label: 'Overall band',
        required: true,
        placeholder: '8.0',
      },
      { kind: 'localizedText', name: 'quote', label: 'Iqtibos', rows: 3 },
      { kind: 'image', name: 'imageUrl', label: 'Sertifikat rasmi', folder: 'results' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'promotions',
    title: 'Aksiyalar',
    singular: 'Aksiya',
    tags: ['promotions'],
    ordered: true,
    publishField: 'isActive',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Nomi', kind: 'localized' },
      { name: 'startsAt', label: 'Boshlanish', kind: 'date' },
      { name: 'endsAt', label: 'Tugash', kind: 'date' },
      { name: 'isActive', label: 'Faol', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Nomi', required: true },
      { kind: 'localizedText', name: 'description', label: 'Tavsif', required: true, rows: 4 },
      { kind: 'date', name: 'startsAt', label: 'Boshlanish sanasi' },
      { kind: 'date', name: 'endsAt', label: 'Tugash sanasi' },
      { kind: 'localized', name: 'ctaLabel', label: 'Tugma matni' },
      { kind: 'text', name: 'ctaHref', label: 'Tugma havolasi' },
      { kind: 'image', name: 'imageUrl', label: 'Fon rasmi', folder: 'promotions' },
      { kind: 'boolean', name: 'isActive', label: 'Faol' },
    ],
  },
  {
    key: 'faq',
    title: 'Savol-javoblar',
    singular: 'Savol',
    tags: ['faq'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'question', localized: true },
    columns: [
      { name: 'question', label: 'Savol', kind: 'localized' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'question', label: 'Savol', required: true },
      { kind: 'localizedText', name: 'answer', label: 'Javob', required: true, rows: 5 },
      { kind: 'relation', name: 'categoryId', label: 'Bo‘lim', source: 'faqCategories' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'faq-categories',
    title: 'FAQ bo‘limlari',
    singular: 'Bo‘lim',
    tags: ['faq'],
    ordered: true,
    searchField: { name: 'name', localized: true },
    columns: [{ name: 'name', label: 'Nomi', kind: 'localized' }],
    fields: [{ kind: 'localized', name: 'name', label: 'Nomi', required: true }],
  },
  {
    key: 'branches',
    title: 'Filiallar',
    singular: 'Filial',
    tags: ['branches'],
    ordered: true,
    publishField: 'isActive',
    searchField: { name: 'name', localized: true },
    columns: [
      { name: 'name', label: 'Nomi', kind: 'localized' },
      { name: 'isActive', label: 'Faol', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'name', label: 'Nomi', required: true },
      { kind: 'localizedText', name: 'address', label: 'Manzil', required: true, rows: 2 },
      { kind: 'stringList', name: 'phones', label: 'Telefonlar' },
      { kind: 'localized', name: 'workingHours', label: 'Ish vaqti' },
      { kind: 'text', name: 'mapEmbedUrl', label: 'Xarita embed havolasi' },
      { kind: 'text', name: 'mapLinkUrl', label: 'Xarita havolasi' },
      { kind: 'image', name: 'imageUrl', label: 'Rasm', folder: 'branches' },
      { kind: 'boolean', name: 'isActive', label: 'Faol' },
    ],
  },
  {
    key: 'navigation',
    title: 'Menyu',
    singular: 'Menyu bandi',
    description: 'Header va footer havolalari.',
    tags: ['nav'],
    ordered: true,
    publishField: 'isVisible',
    searchField: { name: 'href' },
    columns: [
      { name: 'label', label: 'Nomi', kind: 'localized' },
      { name: 'href', label: 'Havola', kind: 'text' },
      { name: 'group', label: 'Guruh', kind: 'badge' },
      { name: 'isVisible', label: 'Ko‘rinadi', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'label', label: 'Nomi', required: true },
      {
        kind: 'text',
        name: 'href',
        label: 'Havola',
        required: true,
        placeholder: '/courses yoki /#services',
      },
      {
        kind: 'select',
        name: 'group',
        label: 'Guruh',
        options: [
          { value: 'header', label: 'Header' },
          { value: 'mobile', label: 'Mobil menyu' },
          { value: 'footer-1', label: 'Footer 1-ustun' },
          { value: 'footer-2', label: 'Footer 2-ustun' },
        ],
      },
      { kind: 'boolean', name: 'openInNew', label: 'Yangi oynada ochilsin' },
      { kind: 'boolean', name: 'isVisible', label: 'Ko‘rinadi' },
    ],
  },
  {
    key: 'material-groups',
    title: 'Material bo‘limlari',
    singular: 'Bo‘lim',
    tags: ['materials'],
    ordered: true,
    searchField: { name: 'name', localized: true },
    columns: [
      { name: 'name', label: 'Nomi', kind: 'localized' },
      { name: 'type', label: 'Turi', kind: 'badge' },
    ],
    fields: [
      { kind: 'localized', name: 'name', label: 'Nomi', required: true },
      { kind: 'select', name: 'type', label: 'Turi', options: MATERIAL_TYPE_OPTIONS },
    ],
  },
  {
    key: 'materials',
    title: 'Materiallar',
    singular: 'Material',
    tags: ['materials'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Nomi', kind: 'localized' },
      { name: 'type', label: 'Turi', kind: 'badge' },
      { name: 'level', label: 'Daraja', kind: 'badge' },
      { name: 'downloadCount', label: 'Yuklamalar', kind: 'number' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Nomi', required: true },
      { kind: 'localizedText', name: 'description', label: 'Tavsif', rows: 3 },
      { kind: 'select', name: 'type', label: 'Turi', options: MATERIAL_TYPE_OPTIONS },
      { kind: 'select', name: 'level', label: 'Daraja', options: LEVEL_OPTIONS },
      { kind: 'relation', name: 'groupId', label: 'Bo‘lim', source: 'materialGroups' },
      { kind: 'text', name: 'fileUrl', label: 'Fayl havolasi', hint: 'Yuklangan fayl manzili' },
      { kind: 'text', name: 'externalUrl', label: 'Tashqi havola (YouTube va h.k.)' },
      { kind: 'image', name: 'coverUrl', label: 'Muqova rasmi', folder: 'materials' },
      { kind: 'number', name: 'fileSize', label: 'Fayl hajmi (bayt)' },
      { kind: 'stringList', name: 'tags', label: 'Teglar' },
      { kind: 'boolean', name: 'requireContact', label: 'Yuklashdan oldin aloqa so‘ralsin' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'vacancies',
    title: 'Vakansiyalar',
    singular: 'Vakansiya',
    tags: ['vacancies'],
    ordered: true,
    publishField: 'isOpen',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Nomi', kind: 'localized' },
      { name: 'slug', label: 'Slug', kind: 'text' },
      { name: 'isOpen', label: 'Ochiq', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Nomi', required: true },
      { kind: 'slug', name: 'slug', label: 'Slug', from: 'title' },
      { kind: 'localizedText', name: 'shortDesc', label: 'Qisqa tavsif', required: true, rows: 3 },
      { kind: 'localizedHtml', name: 'description', label: 'To‘liq tavsif' },
      { kind: 'localizedList', name: 'responsibilities', label: 'Vazifalar' },
      { kind: 'localizedList', name: 'requirements', label: 'Talablar' },
      { kind: 'localizedList', name: 'conditions', label: 'Shartlar' },
      { kind: 'localized', name: 'department', label: 'Bo‘lim' },
      { kind: 'localized', name: 'employmentType', label: 'Bandlik turi' },
      { kind: 'decimal', name: 'salaryFrom', label: 'Maosh (dan)' },
      { kind: 'decimal', name: 'salaryTo', label: 'Maosh (gacha)' },
      { kind: 'boolean', name: 'showSalary', label: 'Maosh ko‘rsatilsin' },
      { kind: 'boolean', name: 'isOpen', label: 'Ochiq' },
    ],
  },
  {
    key: 'hiring-steps',
    title: 'Ishga qabul bosqichlari',
    singular: 'Bosqich',
    tags: ['vacancies'],
    ordered: true,
    searchField: { name: 'title', localized: true },
    columns: [{ name: 'title', label: 'Nomi', kind: 'localized' }],
    fields: [
      { kind: 'localized', name: 'title', label: 'Nomi', required: true },
      { kind: 'localizedText', name: 'description', label: 'Tavsif', required: true, rows: 3 },
    ],
  },
  {
    key: 'posts',
    title: 'Blog',
    singular: 'Maqola',
    tags: ['posts'],
    publishField: 'isPublished',
    searchField: { name: 'title', localized: true },
    defaultSort: { id: 'publishedAt', desc: true },
    columns: [
      { name: 'title', label: 'Sarlavha', kind: 'localized' },
      { name: 'publishedAt', label: 'Sana', kind: 'date' },
      { name: 'viewCount', label: 'Ko‘rishlar', kind: 'number' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Sarlavha', required: true },
      { kind: 'slug', name: 'slug', label: 'Slug', from: 'title' },
      { kind: 'localizedText', name: 'excerpt', label: 'Qisqacha', rows: 3 },
      { kind: 'localizedHtml', name: 'body', label: 'Matn' },
      { kind: 'image', name: 'coverUrl', label: 'Muqova', folder: 'posts' },
      { kind: 'stringList', name: 'tags', label: 'Teglar' },
      { kind: 'number', name: 'readingMinutes', label: 'O‘qish vaqti (daqiqa)' },
      { kind: 'date', name: 'publishedAt', label: 'Chop etilgan sana' },
      { kind: 'localized', name: 'seoTitle', label: 'SEO sarlavha' },
      { kind: 'localizedText', name: 'seoDescription', label: 'SEO tavsif', rows: 2 },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'courses',
    title: 'Kurslar',
    singular: 'Kurs',
    tags: ['courses'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Nomi', kind: 'localized' },
      { name: 'slug', label: 'Slug', kind: 'text' },
      { name: 'price', label: 'Narxi', kind: 'text' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Nomi', required: true },
      { kind: 'slug', name: 'slug', label: 'Slug', from: 'title' },
      { kind: 'localizedText', name: 'shortDesc', label: 'Qisqa tavsif', required: true, rows: 3 },
      { kind: 'localizedHtml', name: 'description', label: 'To‘liq tavsif' },
      {
        kind: 'localized',
        name: 'level',
        label: 'Daraja',
        hint: 'Masalan: Beginner – Upper-Intermediate',
      },
      {
        kind: 'localized',
        name: 'durationLabel',
        label: 'Davomiyligi',
        required: true,
        hint: 'Masalan: 3 oy',
      },
      { kind: 'decimal', name: 'price', label: 'Narxi' },
      {
        kind: 'localized',
        name: 'priceNote',
        label: 'Narx izohi',
        hint: 'Masalan: 1 daraja uchun',
      },
      { kind: 'text', name: 'currency', label: 'Valyuta' },
      { kind: 'text', name: 'publisher', label: 'Nashriyot', placeholder: 'OXFORD' },
      { kind: 'image', name: 'coverUrl', label: 'Muqova rasmi', folder: 'courses' },
      { kind: 'curriculum', name: 'curriculum', label: 'O‘quv dasturi' },
      { kind: 'localizedList', name: 'includes', label: 'Kursga nima kiradi' },
      { kind: 'localizedList', name: 'schedule', label: 'Dars jadvali' },
      { kind: 'multiRelation', name: 'teachers', label: 'Ustozlar', source: 'teachers' },
      { kind: 'boolean', name: 'hasDetailPage', label: 'Alohida sahifasi bo‘lsin' },
      { kind: 'boolean', name: 'isFeatured', label: 'Tanlangan kurs' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
      { kind: 'localized', name: 'seoTitle', label: 'SEO sarlavha' },
      { kind: 'localizedText', name: 'seoDescription', label: 'SEO tavsif', rows: 2 },
    ],
  },
  {
    key: 'teachers',
    title: 'Ustozlar',
    singular: 'Ustoz',
    tags: ['teachers'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'fullName' },
    columns: [
      { name: 'photoUrl', label: 'Rasm', kind: 'image' },
      { name: 'fullName', label: 'Ismi', kind: 'text' },
      { name: 'position', label: 'Lavozimi', kind: 'localized' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'text', name: 'fullName', label: 'To‘liq ismi', required: true },
      { kind: 'slug', name: 'slug', label: 'Slug', from: 'fullName' },
      { kind: 'localized', name: 'position', label: 'Lavozimi', required: true },
      { kind: 'localizedText', name: 'bio', label: 'Qisqacha ma’lumot', rows: 3 },
      { kind: 'image', name: 'photoUrl', label: 'Rasmi (3:4)', folder: 'teachers' },
      { kind: 'localized', name: 'photoAlt', label: 'Rasm alt matni' },
      { kind: 'text', name: 'ieltsScore', label: 'IELTS bali', placeholder: '8.0' },
      { kind: 'stringList', name: 'certificates', label: 'Sertifikatlar' },
      { kind: 'number', name: 'experience', label: 'Tajriba (yil)' },
      { kind: 'multiRelation', name: 'courses', label: 'Kurslari', source: 'courses' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
    ],
  },
  {
    key: 'problems',
    title: 'Muammolar',
    singular: 'Muammo',
    description: 'Har bir muammoning yechimi alohida saqlanadi.',
    tags: ['home'],
    ordered: true,
    publishField: 'isPublished',
    searchField: { name: 'title', localized: true },
    columns: [
      { name: 'title', label: 'Muammo', kind: 'localized' },
      { name: 'isPublished', label: 'Chop etilgan', kind: 'boolean' },
    ],
    fields: [
      { kind: 'localized', name: 'title', label: 'Muammo', required: true },
      { kind: 'localizedText', name: 'description', label: 'Tavsif', required: true, rows: 3 },
      { kind: 'icon', name: 'icon', label: 'Ikonka' },
      { kind: 'boolean', name: 'isPublished', label: 'Chop etilgan' },
      { kind: 'select', name: 'solution.skill', label: 'Yechim: ko‘nikma', options: SKILL_OPTIONS },
      { kind: 'localized', name: 'solution.title', label: 'Yechim: sarlavha' },
      { kind: 'localizedText', name: 'solution.description', label: 'Yechim: tavsif', rows: 3 },
      { kind: 'image', name: 'solution.imageUrl', label: 'Yechim: rasm', folder: 'solutions' },
    ],
  },
];

export const RESOURCE_BY_KEY = new Map(ADMIN_RESOURCES.map((resource) => [resource.key, resource]));
