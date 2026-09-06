/**
 * View-models handed to components. Every field is already localized to a plain
 * string on the server — client components never receive raw `Localized` blobs.
 */

export type SocialKey = 'telegram' | 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'whatsapp';

export type SocialLinks = Partial<Record<SocialKey, string>>;

export type SiteSettingsView = {
  brandName: string;
  tagline: string;
  logoLightUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  externalLmsLabel: string | null;
  externalLmsUrl: string | null;
  phones: string[];
  email: string | null;
  socials: SocialLinks;
  tickerItems: string[];
  currency: string;
  ga4Id: string | null;
  metaPixelId: string | null;
  yandexMetricaId: string | null;
  privacyPolicy: string | null;
  madeByLabel: string | null;
  madeByUrl: string | null;
};

export type NavItemView = {
  id: string;
  label: string;
  href: string;
  group: string;
  openInNew: boolean;
};

export type NavGroups = {
  header: NavItemView[];
  mobile: NavItemView[];
  footerPrimary: NavItemView[];
  footerSecondary: NavItemView[];
};

export type HomeSectionKey =
  | 'hero'
  | 'ticker'
  | 'stats'
  | 'about'
  | 'teachers'
  | 'advantages'
  | 'problems'
  | 'promotions'
  | 'careers'
  | 'courses'
  | 'testimonials'
  | 'materials'
  | 'faq'
  | 'contact';

export type HomeSectionView = {
  key: string;
  order: number;
  isVisible: boolean;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type HeroSlideView = {
  id: string;
  headline: string;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  videoUrl: string | null;
};

export type StatView = {
  id: string;
  value: string;
  label: string;
  icon: string | null;
};

export type AdvantageView = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  imageUrl: string | null;
};

export type SkillKey = 'SPEAKING' | 'LISTENING' | 'READING' | 'WRITING' | 'GRANT';

export type SolutionView = {
  id: string;
  skill: SkillKey;
  title: string;
  description: string;
  imageUrl: string | null;
};

export type ProblemView = {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  solution: SolutionView | null;
};

export type PromotionPrizeView = {
  place: number;
  label: string;
  icon: string | null;
};

export type PromotionView = {
  id: string;
  title: string;
  description: string;
  prizes: PromotionPrizeView[];
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  /** ISO string — cached values must stay JSON-safe. */
  endsAt: string;
};

export type CourseCardView = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  level: string | null;
  durationLabel: string;
  price: number | null;
  priceNote: string | null;
  currency: string;
  publisher: string | null;
  coverUrl: string | null;
  iconUrl: string | null;
  hasDetailPage: boolean;
  isFeatured: boolean;
};

export type CurriculumBlockView = {
  title: string;
  items: string[];
};

export type CourseDetailView = CourseCardView & {
  description: string | null;
  curriculum: CurriculumBlockView[];
  includes: string[];
  schedule: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  teachers: TeacherView[];
  updatedAt: string;
};

export type TeacherView = {
  id: string;
  slug: string;
  fullName: string;
  position: string;
  bio: string | null;
  photoUrl: string | null;
  photoAlt: string | null;
  ieltsScore: string | null;
  certificates: string[];
  experience: number | null;
};

export type SuccessStoryView = {
  id: string;
  studentName: string;
  overallBand: string;
  scores: Record<string, string>;
  imageUrl: string | null;
  quote: string | null;
};

export type TestimonialView = {
  id: string;
  authorName: string;
  authorRole: string | null;
  avatarUrl: string | null;
  content: string;
  rating: number;
  videoUrl: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  isFeatured: boolean;
};

export type FaqItemView = {
  id: string;
  question: string;
  answer: string;
};

export type FaqGroupView = {
  id: string;
  name: string;
  items: FaqItemView[];
};

export type MaterialTypeKey = 'PDF' | 'AUDIO' | 'VIDEO' | 'PHOTO';

export type MaterialLevelKey =
  | 'BEGINNER'
  | 'ELEMENTARY'
  | 'PRE_INTERMEDIATE'
  | 'INTERMEDIATE'
  | 'UPPER_INTERMEDIATE'
  | 'ADVANCED'
  | 'IELTS'
  | 'KIDS';

export type MaterialGroupView = {
  id: string;
  name: string;
  type: MaterialTypeKey;
};

export type MaterialView = {
  id: string;
  title: string;
  description: string | null;
  type: MaterialTypeKey;
  level: MaterialLevelKey | null;
  group: MaterialGroupView | null;
  fileUrl: string | null;
  externalUrl: string | null;
  coverUrl: string | null;
  fileSize: number | null;
  meta: { pages?: number; durationSec?: number; width?: number; height?: number };
  tags: string[];
  requireContact: boolean;
  downloadCount: number;
};

export type MaterialCounts = Record<MaterialTypeKey, number>;

export type BranchView = {
  id: string;
  name: string;
  address: string;
  phones: string[];
  workingHours: string | null;
  mapEmbedUrl: string | null;
  mapLinkUrl: string | null;
  imageUrl: string | null;
};

export type VacancyCardView = {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  department: string | null;
  employmentType: string | null;
  salaryFrom: number | null;
  salaryTo: number | null;
  showSalary: boolean;
};

export type VacancyDetailView = VacancyCardView & {
  description: string | null;
  responsibilities: string[];
  requirements: string[];
  conditions: string[];
};

export type HiringStepView = {
  id: string;
  title: string;
  description: string;
};

export type PostCardView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  tags: string[];
  readingMinutes: number | null;
  /** ISO string. */
  publishedAt: string | null;
};

export type PostDetailView = PostCardView & {
  body: string;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type TestCategoryCardView = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  imageUrl: string | null;
  icon: string | null;
  questionCount: number;
  timeLimitSec: number | null;
  requireContact: boolean;
  allowBack: boolean;
};

export type TestOptionView = {
  id: string;
  text: string;
};

/** Public shape of a question — `isCorrect` never leaves the server. */
export type TestQuestionView = {
  id: string;
  prompt: string;
  /** TEXT questions are typed into rather than chosen from, and carry no options. */
  answerType: 'CHOICE' | 'TEXT';
  imageUrl: string | null;
  audioUrl: string | null;
  options: TestOptionView[];
};

export type TestRunnerView = TestCategoryCardView & {
  /** SCORE shows a mark out of the paper; PROFILE shows the shares. */
  resultMode: 'SCORE' | 'PROFILE';
  /** Questionnaires offered once a scored paper is finished. */
  followUps: { slug: string; title: string; subtitle: string | null }[];
  shuffle: boolean;
  questions: TestQuestionView[];
  maxScore: number;
};

export type TestBandView = {
  id: string;
  /** PROFILE tests match a band on this instead of a score range. */
  profileKey: string | null;
  minScore: number;
  maxScore: number;
  levelName: string;
  title: string;
  description: string;
  course: CourseCardView | null;
};
