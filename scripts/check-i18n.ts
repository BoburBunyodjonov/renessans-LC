import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loc, locList } from '../src/lib/localize';
import { LOCALES, asLocalized, type Locale } from '../src/types/i18n';

/**
 * Three guards:
 *   1. every messages/*.json file has the same key set as uz.json;
 *   2. localized DB values fall back to uz when a translation is blank;
 *   3. no seeded content row is missing its ru/en translation.
 */

type Json = Record<string, unknown>;

function flatten(value: Json, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) => {
    const full = prefix ? `${prefix}.${key}` : key;
    return child && typeof child === 'object' && !Array.isArray(child)
      ? flatten(child as Json, full)
      : [full];
  });
}

let failed = false;

const messagesDir = path.join(process.cwd(), 'messages');
const base = flatten(JSON.parse(fs.readFileSync(path.join(messagesDir, 'uz.json'), 'utf8')));

for (const locale of LOCALES) {
  const keys = flatten(
    JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), 'utf8')),
  );
  const missing = base.filter((key) => !keys.includes(key));
  const extra = keys.filter((key) => !base.includes(key));
  if (missing.length || extra.length) {
    failed = true;
    console.error(
      `  ${locale}.json  missing: ${missing.join(', ') || '—'} | extra: ${extra.join(', ') || '—'}`,
    );
  } else {
    console.log(`  ${locale}.json  ${keys.length} keys, in sync`);
  }
}

const partial = { uz: 'Salom', ru: '', en: '   ' };
const fallbacks = { ru: loc(partial, 'ru'), en: loc(partial, 'en') };
if (fallbacks.ru !== 'Salom' || fallbacks.en !== 'Salom') {
  failed = true;
  console.error('  fallback to uz failed:', fallbacks);
} else {
  console.log('  blank ru/en values fall back to uz');
}

const list = locList([{ uz: 'Bir', ru: '', en: 'One' }], 'ru');
if (list[0] !== 'Bir') {
  failed = true;
  console.error('  list fallback failed:', list);
} else {
  console.log('  localized lists fall back to uz');
}

const prisma = new PrismaClient();

/** Localized `Json` columns that must be complete in all three locales. */
const CONTENT_FIELDS: [string, () => Promise<Record<string, unknown>[]>, string[]][] = [
  ['SiteSetting', () => prisma.siteSetting.findMany(), ['brandName', 'tagline', 'primaryCtaLabel']],
  ['NavItem', () => prisma.navItem.findMany(), ['label']],
  ['HeroSlide', () => prisma.heroSlide.findMany(), ['headline', 'subtitle', 'ctaLabel']],
  ['Stat', () => prisma.stat.findMany(), ['label']],
  ['Course', () => prisma.course.findMany(), ['title', 'shortDesc', 'durationLabel']],
  ['Teacher', () => prisma.teacher.findMany(), ['position']],
  ['Advantage', () => prisma.advantage.findMany(), ['title', 'description']],
  ['Problem', () => prisma.problem.findMany(), ['title', 'description']],
  ['Solution', () => prisma.solution.findMany(), ['title', 'description']],
  ['Testimonial', () => prisma.testimonial.findMany(), ['content']],
  ['Faq', () => prisma.faq.findMany(), ['question', 'answer']],
  ['Material', () => prisma.material.findMany(), ['title']],
  ['Vacancy', () => prisma.vacancy.findMany(), ['title', 'shortDesc']],
  ['HiringStep', () => prisma.hiringStep.findMany(), ['title', 'description']],
  ['Post', () => prisma.post.findMany(), ['title', 'body']],
  ['TestCategory', () => prisma.testCategory.findMany(), ['title', 'subtitle']],
  ['TestLevelBand', () => prisma.testLevelBand.findMany(), ['title', 'description']],
];

async function checkContent() {
  const gaps: string[] = [];

  for (const [model, load, fields] of CONTENT_FIELDS) {
    const rows = await load();
    for (const row of rows) {
      for (const field of fields) {
        const value = asLocalized(row[field]);
        if (!value) continue;
        const missing = (LOCALES as readonly Locale[]).filter((locale) => !value[locale].trim());
        if (missing.length > 0 && value.uz.trim()) {
          gaps.push(`${model}.${field} (${String(row.id)}) missing: ${missing.join(', ')}`);
        }
      }
    }
  }

  if (gaps.length > 0) {
    failed = true;
    console.error(`  ${gaps.length} untranslated content field(s):`);
    for (const gap of gaps.slice(0, 20)) console.error(`    ${gap}`);
  } else {
    console.log('  all seeded content is complete in uz/ru/en');
  }
}

checkContent()
  .catch((error) => {
    failed = true;
    console.error('  content check failed:', error instanceof Error ? error.message : error);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
  });
